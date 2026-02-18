import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getWorkspaceIdForUser } from "../../helpers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceIdForUser(user.id);

    const { count, error: countError } = await supabase
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
    console.error("Message count GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch message count" },
      { status: 500 }
    );
  }
}
