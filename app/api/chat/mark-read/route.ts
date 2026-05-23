import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("workspace_id, bot_id")
      .eq("id", session_id)
      .single();

    if (sessionError || !session?.workspace_id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceRole(session.workspace_id, user.id, [
      "owner",
      "admin",
      "member",
    ]);
    if (membership.role === "member") {
      const allowedIds = membership.allowed_bot_ids ?? [];
      if (!session.bot_id || !allowedIds.includes(session.bot_id)) {
        return NextResponse.json(
          { error: "You do not have access to this session" },
          { status: 403 }
        );
      }
    }

    // Mark all unread messages in the session as read
    const { error } = await supabase
      .from("chat_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("session_id", session_id)
      .eq("is_read", false)
      .eq("sender_type", "user");

    if (error) {
      console.error("Error marking messages as read:", error);
      return NextResponse.json(
        { error: "Failed to mark messages as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in mark read endpoint:", error);
    return jsonError(error);
  }
}
