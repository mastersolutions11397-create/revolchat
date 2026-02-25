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
