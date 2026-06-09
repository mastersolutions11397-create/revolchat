import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/api/yetti/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ invoices: [] });
    }

    const stripeInvoices = await stripe.invoices.list({
      customer: plan.stripe_customer_id,
      limit: 24,
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id:          inv.id,
      date:        inv.created,
      amount:      inv.amount_paid,
      currency:    inv.currency,
      status:      inv.status,
      pdf:         inv.invoice_pdf,
      description: inv.lines.data[0]?.description ?? "Starter Plan",
    }));

    return NextResponse.json({ invoices });
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err
      ? (err as { status: number }).status
      : 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
