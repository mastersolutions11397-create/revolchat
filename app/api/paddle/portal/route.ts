import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/api/yetti/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);

    const { data: plan } = await supabaseAdmin
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/plans`;
    const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? "production";
    const apiBase = env === "sandbox"
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";

    const res = await fetch(`${apiBase}/customer-portal-sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: plan.stripe_customer_id,
        return_url:  returnUrl,
      }),
    });

    const json = await res.json() as { data?: { urls?: { general?: { overview?: string } } }; error?: { detail?: string } };

    if (!res.ok) {
      throw new Error(json.error?.detail ?? "Failed to create portal session");
    }

    const url = json.data?.urls?.general?.overview;
    if (!url) throw new Error("No portal URL returned");

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
