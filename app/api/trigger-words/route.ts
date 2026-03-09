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

// GET /api/trigger-words - Get all trigger words for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";

    let query = supabase
      .from("trigger_words")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/trigger-words - Create a new trigger word
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      trigger_word,
      description,
      media_url,
      media_type,
      media_filename,
      media_size,
    } = body;

    // Validate required fields
    if (!trigger_word || !media_url || !media_type) {
      return NextResponse.json(
        { error: "Missing required fields: trigger_word, media_url, media_type" },
        { status: 400 }
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
      .eq("user_id", userId)
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
        user_id: userId,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
