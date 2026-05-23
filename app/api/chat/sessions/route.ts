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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const workspaceId = searchParams.get("workspace_id");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspace_id is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const membership = await requireWorkspaceRole(workspaceId, user.id, [
      "owner",
      "admin",
      "member",
    ]);

    // Build query
    let query = supabase
      .from("chat_sessions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("last_activity_at", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
    }
    if (membership.role === "member") {
      const allowedIds = membership.allowed_bot_ids ?? [];
      if (!allowedIds.length) {
        return NextResponse.json({ sessions: [] });
      }
      query = query.in("bot_id", allowedIds);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // For each session, get the last message and unread count
    const sessionsWithMessages = await Promise.all(
      (sessions || []).map(async (session) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from("chat_messages")
          .select("message_text, created_at")
          .eq("session_id", session.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("is_read", false)
          .eq("sender_type", "user");

        return {
          ...session,
          last_message: lastMessage?.message_text,
          last_message_time: lastMessage?.created_at,
          unread_count: unreadCount || 0,
        };
      })
    );

    return NextResponse.json({
      sessions: sessionsWithMessages,
    });
  } catch (error) {
    console.error("Error in sessions endpoint:", error);
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const botId = searchParams.get("bot_id");

    if (!platform || !botId) {
      return NextResponse.json(
        { error: "platform and bot_id are required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const { data: bot, error: botError } = await supabase
      .from("agents")
      .select("workspace_id")
      .eq("id", botId)
      .single();

    if (botError || !bot?.workspace_id) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    await requireWorkspaceRole(bot.workspace_id, user.id, ["owner", "admin"]);

    const { data: sessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("workspace_id", bot.workspace_id)
      .eq("platform", platform)
      .eq("bot_id", botId);

    if (fetchError) {
      console.error("Error fetching sessions for delete:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    if (!sessions?.length) {
      return NextResponse.json({
        success: true,
        deleted_count: 0,
      });
    }

    const sessionIds = sessions.map((session) => session.id);

    const { error: deleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .in("id", sessionIds);

    if (deleteError) {
      console.error("Error deleting sessions:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: sessionIds.length,
    });
  } catch (error) {
    console.error("Error in delete sessions endpoint:", error);
    return jsonError(error);
  }
}
