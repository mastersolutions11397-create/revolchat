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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, ai_mode } = body;

    if (!session_id || typeof ai_mode !== "boolean") {
      return NextResponse.json(
        { error: "session_id and ai_mode (boolean) are required" },
        { status: 400 }
      );
    }

    // Update session AI mode
    const { data: session, error } = await supabase
      .from("chat_sessions")
      .update({
        ai_mode: ai_mode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating AI mode:", error);
      return NextResponse.json(
        { error: "Failed to update AI mode" },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session,
    });
  } catch (error) {
    console.error("Error in toggle AI endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
