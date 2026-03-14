import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to get user ID from admin cookie
async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  const admin = verifySignedCookie(cookie.value);
  return admin?.id || null;
}

async function validateBotOwnership(userId: string, botId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("agents")
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// GET /api/trigger-words/[id] - Get a specific trigger word
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: triggerWord, error } = await supabase
      .from("trigger_words")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !triggerWord) {
      return NextResponse.json(
        { error: "Trigger word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trigger_word: triggerWord,
    });
  } catch (error) {
    console.error("Error in trigger-words GET [id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/trigger-words/[id] - Update a trigger word
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { data: existingTrigger, error: existingTriggerError } = await supabase
      .from("trigger_words")
      .select("id, bot_id, trigger_word")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (existingTriggerError || !existingTrigger) {
      return NextResponse.json(
        { error: "Trigger word not found" },
        { status: 404 }
      );
    }

    const {
      bot_id,
      trigger_word,
      description,
      media_url,
      media_type,
      media_filename,
      media_size,
      is_active,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (bot_id !== undefined) {
      const hasAccessToBot = await validateBotOwnership(userId, bot_id);
      if (!hasAccessToBot) {
        return NextResponse.json(
          { error: "Selected bot not found" },
          { status: 404 }
        );
      }
      updateData.bot_id = bot_id;
    }
    if (trigger_word !== undefined) {
      updateData.trigger_word = trigger_word.startsWith("/")
        ? trigger_word.toLowerCase()
        : `/${trigger_word.toLowerCase()}`;
    }
    if (description !== undefined) updateData.description = description;
    if (media_url !== undefined) updateData.media_url = media_url;
    if (media_type !== undefined) updateData.media_type = media_type;
    if (media_filename !== undefined) updateData.media_filename = media_filename;
    if (media_size !== undefined) updateData.media_size = media_size;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const nextBotId = (updateData.bot_id as string | undefined) ?? existingTrigger.bot_id;
    const nextTriggerWord =
      (updateData.trigger_word as string | undefined) ?? existingTrigger.trigger_word;

    if (nextBotId && nextTriggerWord) {
      const { data: conflictingTrigger } = await supabase
        .from("trigger_words")
        .select("id")
        .eq("user_id", userId)
        .eq("bot_id", nextBotId)
        .eq("trigger_word", nextTriggerWord)
        .neq("id", id)
        .single();

      if (conflictingTrigger) {
        return NextResponse.json(
          { error: "Trigger word already exists for this bot" },
          { status: 409 }
        );
      }
    }

    const { data: triggerWord, error } = await supabase
      .from("trigger_words")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating trigger word:", error);
      return NextResponse.json(
        { error: "Failed to update trigger word" },
        { status: 500 }
      );
    }

    if (!triggerWord) {
      return NextResponse.json(
        { error: "Trigger word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trigger_word: triggerWord,
    });
  } catch (error) {
    console.error("Error in trigger-words PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/trigger-words/[id] - Delete a trigger word
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from("trigger_words")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting trigger word:", error);
      return NextResponse.json(
        { error: "Failed to delete trigger word" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in trigger-words DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
