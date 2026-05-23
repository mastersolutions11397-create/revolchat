import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

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

/** Resolve the authenticated user's workspace ID, or null if none exists. */
export async function getWorkspaceIdForUser(userId: string): Promise<string | null> {
  const { data: byOwner, error: e1 } = await supabaseAdmin
    .from("workspaces")
    .select("id")
    .or(`owner_id.eq.${userId},user_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!e1 && byOwner?.id) return byOwner.id;

  const { data: member, error: e2 } = await supabaseAdmin
    .from("yetti_workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!e2 && member?.workspace_id) return member.workspace_id;

  return null;
}
