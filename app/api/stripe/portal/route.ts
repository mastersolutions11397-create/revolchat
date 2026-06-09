import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/api/yetti/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

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

    const session = await stripe.billingPortal.sessions.create({
      customer:   plan.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err
      ? (err as { status: number }).status
      : 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
