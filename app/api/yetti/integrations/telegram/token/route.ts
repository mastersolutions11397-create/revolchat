import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
  getWorkspaceIdForUser,
} from "../../../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireWorkspaceRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const { searchParams } = new URL(request.url);
    const workspaceId =
      searchParams.get("workspace_id") || (await getWorkspaceIdForUser(user.id));

    if (!workspaceId) {
      return NextResponse.json(
        { message: "No workspace found" },
        { status: 404 }
      );
    }
    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin", "member"]);

    // Find the first Telegram-enabled agent for this workspace.
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .select("telegram_username, telegram_first_name, telegram_bot_token")
      .eq("workspace_id", workspaceId)
      .not("telegram_bot_token", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch telegram bot info:", error);
      return NextResponse.json(
        { message: "Failed to fetch telegram bot info" },
        { status: 500 }
      );
    }

    if (!agent || !agent.telegram_username) {
      return NextResponse.json(
        { message: "No telegram integration found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: agent.telegram_username,
      first_name: agent.telegram_first_name || "",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { message: error.message },
        { status: Number((error as Error & { status?: number }).status) || 500 }
      );
    }
    console.error("Telegram token GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch telegram bot info" },
      { status: 500 }
    );
  }
}
