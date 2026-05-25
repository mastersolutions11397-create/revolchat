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

async function validateBotOwnership(userId: string, botId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("agents")
    .select("id, user_id, workspace_id")
    .eq("id", botId)
    .single();

  if (error || !data) {
    return false;
  }

  if (data.user_id === userId) return true;
  if (!data.workspace_id) return false;

  try {
    await requireWorkspaceRole(data.workspace_id, userId, ["owner", "admin", "member"]);
    return true;
  } catch {
    return false;
  }
}

// GET /api/trigger-words - Get all trigger words for user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";
    const botId = searchParams.get("bot_id");

    let query = supabase
      .from("trigger_words")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    if (botId) {
      query = query.eq("bot_id", botId);
    }

    const { data: triggerWords, error } = await query;

    if (error) {
      console.error("Error fetching trigger words:", error);
      return NextResponse.json(
        { error: "Failed to fetch trigger words" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trigger_words: triggerWords || [],
    });
  } catch (error) {
    console.error("Error in trigger-words GET:", error);
    return jsonError(error);
  }
}

// POST /api/trigger-words - Create a new trigger word
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const body = await request.json();
    const {
      bot_id,
      trigger_word,
      description,
      media_url,
      media_type,
      media_filename,
      media_size,
    } = body;

    // Validate required fields
    if (!bot_id || !trigger_word || !media_url || !media_type) {
      return NextResponse.json(
        { error: "Missing required fields: bot_id, trigger_word, media_url, media_type" },
        { status: 400 }
      );
    }

    const hasAccessToBot = await validateBotOwnership(user.id, bot_id);
    if (!hasAccessToBot) {
      return NextResponse.json(
        { error: "Selected bot not found" },
        { status: 404 }
      );
    }

    // Ensure trigger word starts with /
    const formattedTrigger = trigger_word.startsWith("/")
      ? trigger_word.toLowerCase()
      : `/${trigger_word.toLowerCase()}`;

    // Check if trigger word already exists for user
    const { data: existing } = await supabase
      .from("trigger_words")
      .select("id")
      .eq("user_id", user.id)
      .eq("bot_id", bot_id)
      .eq("trigger_word", formattedTrigger)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Trigger word already exists" },
        { status: 409 }
      );
    }

    const { data: triggerWord, error } = await supabase
      .from("trigger_words")
      .insert({
        user_id: user.id,
        bot_id,
        trigger_word: formattedTrigger,
        description,
        media_url,
        media_type,
        media_filename,
        media_size,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trigger word:", error);
      return NextResponse.json(
        { error: "Failed to create trigger word" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trigger_word: triggerWord,
    });
  } catch (error) {
    console.error("Error in trigger-words POST:", error);
    return jsonError(error);
  }
}
