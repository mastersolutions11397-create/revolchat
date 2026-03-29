import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
} from "../../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    await authenticate(request);

    const { count, error: countError } = await supabaseAdmin
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .not("session_id", "is", null);

    if (countError) {
      console.error("Failed to fetch message count:", countError);
      return NextResponse.json(
        { message: "Failed to fetch message count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Message count GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch message count" },
      { status: 500 }
    );
  }
}
