import { NextRequest, NextResponse } from "next/server";

type TelegramBotInfo = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
};

type ValidateResponse = {
  valid: boolean;
  bot_info?: TelegramBotInfo | null;
  error?: string | null;
};

// POST /api/telegram/validate - Validate a Telegram bot token
export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponse>> {
  try {
    const body = await request.json();
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: "Token is required",
      });
    }

    // Call Telegram Bot API to validate token
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({
        valid: false,
        error: data.description || "Invalid token",
      });
    }

    const result = data.result || {};
    const botInfo: TelegramBotInfo = {
      id: result.id || 0,
      is_bot: result.is_bot || false,
      first_name: result.first_name || "",
      username: result.username || "",
      can_join_groups: result.can_join_groups || false,
      can_read_all_group_messages: result.can_read_all_group_messages || false,
      supports_inline_queries: result.supports_inline_queries || false,
    };

    return NextResponse.json({
      valid: true,
      bot_info: botInfo,
    });
  } catch (err) {
    console.error("Error validating Telegram token:", err);
    return NextResponse.json({
      valid: false,
      error: err instanceof Error ? err.message : "Failed to validate token",
    });
  }
}
