import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin"]);
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json({ error: "Workspace name is too short" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .update({ name })
      .eq("id", workspaceId)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({
      workspace: {
        id: data.id,
        name: data.name,
        owner_id: data.owner_id ?? data.user_id,
        role: "owner",
        is_active: data.is_active,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
