import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
  getWorkspaceIdForUser,
} from "../../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireWorkspaceRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const { searchParams } = new URL(request.url);
    const workspaceId =
      searchParams.get("workspace_id") || (await getWorkspaceIdForUser(user.id));

    if (!workspaceId) {
      return NextResponse.json({ count: 0 });
    }

    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin", "member"]);

    const { count, error: countError } = await supabaseAdmin
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
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
    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { message: error.message },
        { status: Number((error as Error & { status?: number }).status) || 500 }
      );
    }
    console.error("Message count GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch message count" },
      { status: 500 }
    );
  }
}
