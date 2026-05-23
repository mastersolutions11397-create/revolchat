import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeBotIds(input: unknown) {
  return Array.isArray(input)
    ? input.filter((value): value is string => typeof value === "string")
    : [];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin"]);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = body.role === "admin" ? "admin" : "member";
    const allowedBotIds = normalizeBotIds(body.allowed_bot_ids);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const token = crypto.randomBytes(24).toString("base64url");
    const { data, error } = await supabaseAdmin
      .from("yetti_workspace_invitations")
      .insert({
        workspace_id: workspaceId,
        invited_by: user.id,
        email,
        role,
        token,
        allowed_bot_ids: allowedBotIds,
        status: "pending",
      })
      .select("id, email, role, token, allowed_bot_ids, status, created_at")
      .single();
    if (error) throw error;

    const inviteUrl = new URL(`/invite/${token}`, request.url).toString();
    return NextResponse.json(
      { invitation: data, invite_url: inviteUrl },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
