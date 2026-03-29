import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Build query
    let query = supabase
      .from("chat_sessions")
      .select("*")
      .order("last_activity_at", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const { data: sessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id")
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
