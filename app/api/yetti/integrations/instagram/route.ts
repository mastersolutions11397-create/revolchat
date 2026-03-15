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
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Check if there's an active Instagram session in chat_sessions
    const { data: session } = await supabaseAdmin
      .from("chat_sessions")
      .select("external_username, external_photo_url")
      .eq("workspace_id", workspaceId)
      .eq("platform", "instagram")
      .eq("session_status", "active")
      .limit(1)
      .maybeSingle();

    if (session && session.external_username) {
      return NextResponse.json({
        success: true,
        data: {
          username: session.external_username,
          profile_picture: session.external_photo_url || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Instagram integration GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch instagram integration" },
      { status: 500 }
    );
  }
}
