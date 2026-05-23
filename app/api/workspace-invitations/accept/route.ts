import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }

    const { data: invite, error } = await supabaseAdmin
      .from("yetti_workspace_invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();
    if (error) throw error;
    if (!invite) {
      return NextResponse.json({ error: "Invitation is invalid or expired" }, { status: 404 });
    }
    if (user.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation belongs to another email address" },
        { status: 403 }
      );
    }

    const { error: upsertError } = await supabaseAdmin
      .from("yetti_workspace_members")
      .upsert(
        {
          workspace_id: invite.workspace_id,
          user_id: user.id,
          email: user.email ?? invite.email,
          role: invite.role,
          allowed_bot_ids: invite.allowed_bot_ids ?? [],
        },
        { onConflict: "workspace_id,user_id" }
      );
    if (upsertError) throw upsertError;

    const { error: updateError } = await supabaseAdmin
      .from("yetti_workspace_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    if (updateError) throw updateError;

    return NextResponse.json({ workspace_id: invite.workspace_id });
  } catch (error) {
    return jsonError(error);
  }
}
