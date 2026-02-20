import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

export interface TimeRange {
  start: string;
  end: string;
}

export type WeeklySchedule = Partial<Record<DayKey, TimeRange[]>>;

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export const serializeRow = (row: any) => ({
  workspace_id: row.workspace_id,
  timezone: row.timezone,
  schedule: row.schedule ?? {},
  respect_schedule: row.respect_schedule ?? true,
  workspace_online: row.workspace_online ?? true,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

function adminToUser(admin: { id: string; email: string }): User {
  return {
    id: admin.id,
    email: admin.email,
    user_metadata: {},
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

export async function authenticate(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) return data.user;
    }
  }

  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (adminCookie?.value) {
    const admin = verifySignedCookie(adminCookie.value);
    if (admin) return adminToUser(admin);
  }

  throw new ApiError("Missing or invalid Authorization header", 401);
}

export async function ensureWorkspaceMembership(
  workspaceId: string,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from("yetti_workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError("Failed to verify workspace membership");
  }

  if (!data) {
    throw new ApiError("Access denied to workspace", 403);
  }
}

export function validateTimezone(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new ApiError("timezone is required", 422);
  }
  const normalized = input.trim();
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: normalized,
    }).resolvedOptions().timeZone;
  } catch {
    throw new ApiError(`Invalid timezone '${normalized}'`, 422);
  }
}

export function validateSchedule(input: unknown): WeeklySchedule {
  if (input === undefined) {
    return {};
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError("schedule must be an object keyed by weekdays", 422);
  }

  const schedule: WeeklySchedule = {};

  for (const [day, value] of Object.entries(input as Record<string, unknown>)) {
    if (!DAY_KEYS.includes(day as DayKey)) {
      throw new ApiError(`Invalid weekday '${day}'`, 422);
    }

    if (!Array.isArray(value)) {
      throw new ApiError(`schedule.${day} must be an array`, 422);
    }

    const timeRanges: TimeRange[] = [];

    value.forEach((slot, index) => {
      if (!slot || typeof slot !== "object") {
        throw new ApiError(`schedule.${day}[${index}] must be an object`, 422);
      }

      const { start, end } = slot as { start?: unknown; end?: unknown };

      if (typeof start !== "string" || !TIME_REGEX.test(start)) {
        throw new ApiError(
          `schedule.${day}[${index}].start must be HH:MM (24h)`,
          422
        );
      }

      if (typeof end !== "string" || !TIME_REGEX.test(end)) {
        throw new ApiError(
          `schedule.${day}[${index}].end must be HH:MM (24h)`,
          422
        );
      }

      if (start >= end) {
        throw new ApiError(
          `schedule.${day}[${index}].end must be later than start`,
          422
        );
      }

      timeRanges.push({ start, end });
    });

    if (timeRanges.length) {
      timeRanges.sort((a, b) => a.start.localeCompare(b.start));
      schedule[day as DayKey] = timeRanges;
    }
  }

  return schedule;
}

export async function fetchWorkspaceHours(workspaceId: string) {
  const { data, error } = await supabaseAdmin
    .from("yetti_workspace_hours")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new ApiError("Failed to load workspace schedule");
  }

  return data;
}

export function normalizeWorkspaceId(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new ApiError("Invalid workspace id", 400);
  }
  return input;
}

