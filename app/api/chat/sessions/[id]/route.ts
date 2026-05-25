import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Session id is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("bot_id")
      .eq("id", id)
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

    await requireWorkspaceRole(bot.workspace_id, user.id, ["owner", "admin"]);

    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting session:", error);
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_session_id: id,
    });
  } catch (error) {
    console.error("Error in delete session endpoint:", error);
    return jsonError(error);
  }
}
