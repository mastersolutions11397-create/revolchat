import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/api/yetti/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { paddle } from "@/lib/paddle";

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

    const invoices: Array<{
      id: string; date: number; amount: number;
      currency: string; status: string; pdf: string | null; description: string;
    }> = [];

    const txCollection = paddle.transactions.list({
      customerId: [plan.stripe_customer_id],
      perPage: 24,
    });

    for await (const tx of txCollection) {
      if (tx.status !== "completed" && tx.status !== "past_due") continue;

      // Fetch PDF URL per transaction (best-effort)
      let pdfUrl: string | null = null;
      try {
        const pdf = await paddle.transactions.getInvoicePDF(tx.id);
        pdfUrl = pdf?.url ?? null;
      } catch { /* no PDF available */ }

      invoices.push({
        id:          tx.id,
        date:        new Date(tx.createdAt).getTime() / 1000,
        amount:      parseInt(tx.details?.totals?.total ?? "0", 10),
        currency:    tx.currencyCode ?? "USD",
        status:      tx.status === "completed" ? "paid" : tx.status,
        pdf:         pdfUrl,
        description: tx.items?.[0]?.price?.description ?? "Starter Plan",
      });
    }

    return NextResponse.json({ invoices });
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
