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
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("bot_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session?.bot_id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data: bot, error: botError } = await supabase
      .from("agents")
      .select("workspace_id")
      .eq("id", session.bot_id)
      .single();

    if (botError || !bot?.workspace_id) {
      return NextResponse.json({ error: "Bot not found for this session" }, { status: 404 });
    }

    const membership = await requireWorkspaceRole(bot.workspace_id, user.id, [
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

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
    });
  } catch (error) {
    console.error("Error in messages endpoint:", error);
    return jsonError(error);
  }
}
