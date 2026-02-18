import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function authenticate(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw new ApiError("Missing or invalid Authorization header", 401);
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new ApiError("Missing access token", 401);
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError("Invalid or expired access token", 401);
  }
  return data.user;
}

/** Resolve the authenticated user's workspace ID (no workspace concept in API surface). */
export async function getWorkspaceIdForUser(userId: string): Promise<string> {
  // Prefer workspace where user is owner
  const { data: byOwner, error: e1 } = await supabaseAdmin
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!e1 && byOwner?.id) return byOwner.id;

  // Fallback: first workspace from membership
  const { data: member, error: e2 } = await supabaseAdmin
    .from("yetti_workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!e2 && member?.workspace_id) return member.workspace_id;

  // Create a default workspace for the user
  const now = new Date().toISOString();
  const { data: created, error: e3 } = await supabaseAdmin
    .from("workspaces")
    .insert({
      owner_id: userId,
      name: "My Workspace",
      workspace_type: "personal",
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (e3 || !created?.id) {
    throw new ApiError("No workspace found and could not create one", 403);
  }
  return created.id;
}
