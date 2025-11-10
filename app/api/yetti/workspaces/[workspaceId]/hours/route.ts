import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
  ensureWorkspaceMembership,
  fetchWorkspaceHours,
  normalizeWorkspaceId,
  serializeRow,
  validateSchedule,
  validateTimezone,
} from "./helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await authenticate(request);
    const workspaceId = normalizeWorkspaceId(params.workspaceId);
    await ensureWorkspaceMembership(workspaceId, user.id);

    const row = await fetchWorkspaceHours(workspaceId);
    if (!row) {
      throw new ApiError("Workspace hours not configured", 404);
    }

    return NextResponse.json(serializeRow(row));
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Workspace hours GET failed", error);
    return NextResponse.json(
      { message: "Failed to fetch workspace hours" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await authenticate(request);
    const workspaceId = normalizeWorkspaceId(params.workspaceId);
    await ensureWorkspaceMembership(workspaceId, user.id);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      throw new ApiError("Request body must be a JSON object", 400);
    }

    const existing = await fetchWorkspaceHours(workspaceId);

    const timezone = validateTimezone(
      (body as Record<string, unknown>).timezone ??
        existing?.timezone ??
        "UTC"
    );
    const schedule = validateSchedule(
      (body as Record<string, unknown>).schedule ??
        existing?.schedule ??
        {}
    );

    const respectSchedule =
      typeof (body as Record<string, unknown>).respect_schedule === "boolean"
        ? (body as Record<string, unknown>).respect_schedule
        : typeof existing?.respect_schedule === "boolean"
        ? existing.respect_schedule
        : true;

    const workspaceOnline =
      typeof (body as Record<string, unknown>).workspace_online === "boolean"
        ? (body as Record<string, unknown>).workspace_online
        : typeof existing?.workspace_online === "boolean"
        ? existing.workspace_online
        : true;

    const payload = {
      workspace_id: workspaceId,
      timezone,
      schedule,
      respect_schedule: respectSchedule,
      workspace_online: workspaceOnline,
    };

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("yetti_workspace_hours")
        .update(payload)
        .eq("workspace_id", workspaceId)
        .select()
        .maybeSingle();

      if (error) {
        throw new ApiError("Failed to update workspace hours");
      }
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("yetti_workspace_hours")
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        throw new ApiError("Failed to create workspace hours");
      }
      result = data;
    }

    return NextResponse.json(serializeRow(result));
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Workspace hours PUT failed", error);
    return NextResponse.json(
      { message: "Failed to save workspace hours" },
      { status: 500 }
    );
  }
}

