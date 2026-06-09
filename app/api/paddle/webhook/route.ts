import { NextRequest, NextResponse } from "next/server";
import { paddle, PLAN_CONFIGS, PlanConfig } from "@/lib/paddle";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { EventName } from "@paddle/paddle-node-sdk";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") ?? "";
  const body = await request.text();

  if (!signature || !body) {
    return NextResponse.json({ error: "Missing signature or body" }, { status: 400 });
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("PADDLE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const ev = paddle.webhooks.unmarshal(body, webhookSecret, signature);
  if (!ev) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Received Paddle webhook:", ev.eventType);

  try {
    switch (ev.eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated:
        await handleSubscriptionChange(ev.data as unknown as PaddleSubscription);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscriptionCancelled(ev.data as unknown as PaddleSubscription);
        break;
      case EventName.SubscriptionPastDue:
        await handleSubscriptionPastDue(ev.data as unknown as PaddleSubscription);
        break;
      case EventName.TransactionPaid:
        await handleTransactionPaid(ev.data as unknown as PaddleTransaction);
        break;
      default:
        console.log(`Unhandled Paddle event: ${ev.eventType}`);
    }
  } catch (err) {
    console.error(`Error handling Paddle event ${ev.eventType}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type PaddleSubscription = {
  id: string;
  status: string;
  customer_id: string;
  items: Array<{ price: { id: string } }>;
  current_billing_period?: { starts_at: string; ends_at: string };
};

type PaddleTransaction = {
  id: string;
  subscription_id?: string;
  customer_id: string;
  status: string;
};

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data: plan } = await supabaseAdmin
    .from("user_plans")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .limit(1)
    .maybeSingle();
  return plan?.user_id ?? null;
}

async function handleSubscriptionChange(sub: PaddleSubscription) {
  const userId = await getUserIdFromCustomer(sub.customer_id);
  if (!userId) {
    console.error("No user found for Paddle customer:", sub.customer_id);
    return;
  }

  const priceId = sub.items[0]?.price?.id;
  const planConfig: PlanConfig | undefined = Object.values(PLAN_CONFIGS).find(
    (c) => c.priceId === priceId
  );
  const planName = planConfig?.name ?? "Starter";
  const status = sub.status === "active" ? "active" : "past_due";

  const planData = {
    user_id:                userId,
    plan_name:              planName,
    stripe_subscription_id: sub.id,
    stripe_customer_id:     sub.customer_id,
    status,
    current_period_start:   sub.current_billing_period?.starts_at ?? new Date().toISOString(),
    current_period_end:     sub.current_billing_period?.ends_at   ?? new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("user_plans")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("user_plans").update(planData).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("user_plans").insert(planData);
  }

  console.log(`Subscription ${sub.id} synced for user ${userId} — ${status}`);
}

async function handleSubscriptionCancelled(sub: PaddleSubscription) {
  const { data: trial } = await supabaseAdmin
    .from("end_user_trials")
    .select("id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (trial) {
    await supabaseAdmin.from("end_user_trials").update({ status: "cancelled" }).eq("id", trial.id);
    console.log(`End-user trial ${trial.id} cancelled`);
    return;
  }

  await supabaseAdmin.from("user_plans").update({ status: "canceled" }).eq("stripe_subscription_id", sub.id);
  console.log(`Subscription ${sub.id} cancelled`);
}

async function handleSubscriptionPastDue(sub: PaddleSubscription) {
  const { data: trial } = await supabaseAdmin
    .from("end_user_trials")
    .select("id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (trial) {
    await supabaseAdmin.from("end_user_trials").update({ status: "expired" }).eq("id", trial.id);
    return;
  }

  await supabaseAdmin.from("user_plans").update({ status: "past_due" }).eq("stripe_subscription_id", sub.id);
  console.log(`Subscription ${sub.id} past due`);
}

async function handleTransactionPaid(tx: PaddleTransaction) {
  if (!tx.subscription_id) return;

  const { data: trial } = await supabaseAdmin
    .from("end_user_trials")
    .select("id, status")
    .eq("stripe_subscription_id", tx.subscription_id)
    .maybeSingle();

  if (trial) {
    if (trial.status !== "subscribed") {
      await supabaseAdmin.from("end_user_trials").update({ status: "subscribed" }).eq("id", trial.id);
    }
    console.log(`End-user trial ${trial.id} renewed`);
    return;
  }

  const userId = await getUserIdFromCustomer(tx.customer_id);
  if (!userId) return;
  await processReferralCommission(userId, tx.id);
}

async function processReferralCommission(userId: string, txId: string) {
  try {
    const { data: referral } = await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referee_id", userId)
      .in("status", ["pending", "completed"])
      .maybeSingle();

    if (!referral) return;

    const { data: userPlan } = await supabaseAdmin
      .from("user_plans")
      .select("id, plan_name, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!userPlan) return;

    const planConfig = Object.values(PLAN_CONFIGS).find(
      (c) => c.name.toLowerCase() === userPlan.plan_name.toLowerCase()
    );
    const planPrice = planConfig?.price ?? 29;

    const monthsDiff =
      (Date.now() - new Date(userPlan.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const paymentMonth = monthsDiff >= 2 ? 3 : monthsDiff >= 1 ? 2 : 1;
    if (paymentMonth > 3) return;

    const { data: existing } = await supabaseAdmin
      .from("referral_commissions")
      .select("id")
      .eq("referral_id", referral.id)
      .eq("user_plan_id", userPlan.id)
      .eq("payment_month", paymentMonth)
      .maybeSingle();

    if (existing) return;

    const commissionAmount = parseFloat((planPrice * 0.3).toFixed(2));

    await supabaseAdmin.from("referral_commissions").insert({
      referral_id:       referral.id,
      referrer_id:       referral.referrer_id,
      referee_id:        userId,
      plan_name:         userPlan.plan_name,
      plan_price:        planPrice,
      commission_amount: commissionAmount,
      commission_type:   "cash",
      status:            "pending",
      stripe_invoice_id: txId,
      user_plan_id:      userPlan.id,
      payment_month:     paymentMonth,
    });

    if (paymentMonth === 1) {
      await supabaseAdmin
        .from("referrals")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", referral.id);

      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("total_referrals, total_earnings")
        .eq("user_id", referral.referrer_id)
        .single();

      if (profile) {
        await supabaseAdmin.from("user_profiles").update({
          total_referrals: (profile.total_referrals || 0) + 1,
          total_earnings:  parseFloat(((profile.total_earnings || 0) + commissionAmount).toFixed(2)),
        }).eq("user_id", referral.referrer_id);
      }
    }

    console.log(`Referral commission $${commissionAmount} for referrer ${referral.referrer_id}`);
  } catch (err) {
    console.error("processReferralCommission error:", err);
  }
}
