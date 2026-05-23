import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeRole(input: unknown) {
  return input === "admin" || input === "member" ? input : "member";
}

function normalizeBotIds(input: unknown) {
  return Array.isArray(input)
    ? input.filter((value): value is string => typeof value === "string")
    : [];
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(workspaceId, user.id, ["owner"]);
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("yetti_workspace_members")
      .update({
        role: normalizeRole(body.role),
        allowed_bot_ids: normalizeBotIds(body.allowed_bot_ids),
      })
      .eq("workspace_id", workspaceId)
      .eq("id", memberId)
      .neq("role", "owner")
      .select("id, user_id, email, role, allowed_bot_ids, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ member: data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(workspaceId, user.id, ["owner"]);
    const { error } = await supabaseAdmin
      .from("yetti_workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", memberId)
      .neq("role", "owner");
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
