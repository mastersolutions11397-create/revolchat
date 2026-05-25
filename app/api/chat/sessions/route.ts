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

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const workspaceId = searchParams.get("workspace_id");
    const rawBotId = searchParams.get("bot_id");
    const botId = rawBotId && rawBotId !== "undefined" && isValidUuid(rawBotId)
      ? rawBotId
      : null;

    const user = await getAuthenticatedUser(request);
    let resolvedWorkspaceId =
      workspaceId && workspaceId !== "undefined" && isValidUuid(workspaceId)
        ? workspaceId
        : null;

    if (!resolvedWorkspaceId && rawBotId && !botId) {
      return NextResponse.json(
        { error: "A valid bot_id is required" },
        { status: 400 }
      );
    }

    if (botId) {
      const { data: bot, error: botError } = await supabase
        .from("agents")
        .select("workspace_id")
        .eq("id", botId)
        .single();

      if (botError || !bot?.workspace_id || !isValidUuid(bot.workspace_id)) {
        return NextResponse.json(
          { error: "A valid workspace_id is required" },
          { status: 400 }
        );
      }
      resolvedWorkspaceId = bot.workspace_id;
    }

    if (!resolvedWorkspaceId) {
      return NextResponse.json(
        { error: "A valid workspace_id is required" },
        { status: 400 }
      );
    }

    const membership = await requireWorkspaceRole(resolvedWorkspaceId, user.id, [
      "owner",
      "admin",
      "member",
    ]);

    // Build query
    let query = supabase
      .from("chat_sessions")
      .select("*")
      .order("last_activity_at", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
    }
    if (botId) {
      query = query.eq("bot_id", botId);
    } else if (resolvedWorkspaceId) {
      const { data: workspaceBots, error: botsError } = await supabase
        .from("agents")
        .select("id")
        .eq("workspace_id", resolvedWorkspaceId);

      if (botsError) throw botsError;
      const botIds = (workspaceBots ?? []).map((bot) => bot.id);
      if (!botIds.length) {
        return NextResponse.json({ sessions: [] });
      }
      query = query.in("bot_id", botIds);
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
        { error: error.message || "Failed to fetch sessions" },
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
    const workspaceId = searchParams.get("workspace_id");
    const rawBotId = searchParams.get("bot_id");
    const botId = rawBotId && rawBotId !== "undefined" && isValidUuid(rawBotId)
      ? rawBotId
      : null;

    if (!platform) {
      return NextResponse.json(
        { error: "platform is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    let resolvedWorkspaceId =
      workspaceId && workspaceId !== "undefined" && isValidUuid(workspaceId)
        ? workspaceId
        : null;

    if (!resolvedWorkspaceId && rawBotId && !botId) {
      return NextResponse.json(
        { error: "A valid bot_id is required" },
        { status: 400 }
      );
    }

    if (botId) {
      const { data: bot, error: botError } = await supabase
        .from("agents")
        .select("workspace_id")
        .eq("id", botId)
        .single();

      if (botError || !bot?.workspace_id || !isValidUuid(bot.workspace_id)) {
        return NextResponse.json(
          { error: "A valid workspace_id is required" },
          { status: 400 }
        );
      }

      resolvedWorkspaceId = bot.workspace_id;
    }

    if (!resolvedWorkspaceId) {
      return NextResponse.json(
        { error: "A valid workspace_id is required" },
        { status: 400 }
      );
    }

    await requireWorkspaceRole(resolvedWorkspaceId, user.id, ["owner", "admin"]);

    let sessionsQuery = supabase
      .from("chat_sessions")
      .select("id")
      .eq("platform", platform);

    if (botId) {
      sessionsQuery = sessionsQuery.eq("bot_id", botId);
    } else if (resolvedWorkspaceId) {
      const { data: workspaceBots, error: botsError } = await supabase
        .from("agents")
        .select("id")
        .eq("workspace_id", resolvedWorkspaceId);

      if (botsError) throw botsError;
      const botIds = (workspaceBots ?? []).map((bot) => bot.id);
      if (!botIds.length) {
        return NextResponse.json({ success: true, deleted_count: 0 });
      }
      sessionsQuery = sessionsQuery.in("bot_id", botIds);
    }

    const { data: sessions, error: fetchError } = await sessionsQuery;

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
