import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export class RouteAuthError extends Error {
  status = 401;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        return { id: data.user.id, email: data.user.email ?? null };
      }
    }
  }

  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (adminCookie?.value) {
    const admin = verifySignedCookie(adminCookie.value);
    if (admin) return { id: admin.id, email: admin.email };
  }

  throw new RouteAuthError("Unauthorized");
}

export async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  allowedRoles: string[] = ["owner", "admin"]
) {
  const { data, error } = await supabaseAdmin
    .from("yetti_workspace_members")
    .select("id, role, allowed_bot_ids")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !allowedRoles.includes(data.role)) {
    const err = new Error("You do not have permission for this workspace");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return data as { id: string; role: string; allowed_bot_ids: string[] | null };
}

export function jsonError(error: unknown) {
  const status =
    typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status) || 500
      : error instanceof RouteAuthError
        ? error.status
        : 500;
  const message = error instanceof Error ? error.message : "Request failed";
  return Response.json({ error: message }, { status });
}
