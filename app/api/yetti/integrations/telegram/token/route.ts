import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
} from "../../../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Find the first agent with a telegram_bot_token for this user
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .select("telegram_username, telegram_first_name, telegram_bot_token")
      .eq("user_id", user.id)
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
    console.error("Telegram token GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch telegram bot info" },
      { status: 500 }
    );
  }
}
