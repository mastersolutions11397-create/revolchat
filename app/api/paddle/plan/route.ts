import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/api/yetti/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    const { data: plan } = await supabaseAdmin
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ plan: plan ?? null });
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
