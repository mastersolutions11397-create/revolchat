import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
  getWorkspaceIdForUser,
} from "../../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const workspaceId = await getWorkspaceIdForUser(user.id);

    if (!workspaceId) {
      return NextResponse.json({ count: 0 });
    }

    const { count, error: countError } = await supabaseAdmin
      .from("yetti_chat_history")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

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
