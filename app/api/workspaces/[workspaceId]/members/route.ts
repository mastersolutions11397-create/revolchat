import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin"]);

    const [{ data: members, error: membersError }, { data: invitations, error: invitesError }] =
      await Promise.all([
        supabaseAdmin
          .from("yetti_workspace_members")
          .select("id, user_id, email, role, allowed_bot_ids, created_at")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("yetti_workspace_invitations")
          .select("id, email, role, token, allowed_bot_ids, status, created_at")
          .eq("workspace_id", workspaceId)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);

    if (membersError) throw membersError;
    if (invitesError) throw invitesError;

    return NextResponse.json({
      members: members ?? [],
      invitations: invitations ?? [],
    });
  } catch (error) {
    return jsonError(error);
  }
}
