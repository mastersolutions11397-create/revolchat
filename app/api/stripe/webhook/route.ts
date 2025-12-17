import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { PLAN_CONFIGS, PlanConfig } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

// Helper function to get current balance from Supabase
async function getCurrentBalance(userId: string): Promise<number> {
  try {
    const { data: latestTransaction, error: balanceError } = await supabaseAdmin
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (balanceError && balanceError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine for new users
      console.error("Error fetching balance:", balanceError);
      return 0;
    }

    // If no transactions exist, balance is 0
    return latestTransaction?.balance ?? 0;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as Uint8Array for proper signature verification
    const body = await request.arrayBuffer();
    const bodyString = new TextDecoder().decode(body);

    const headersList = await headers();
    const sig = headersList.get("stripe-signature")!;

    if (!sig) {
      console.error("Missing stripe-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    console.log("SIG in Header = ", sig);
    console.log("SIG in env=", process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Body length:", bodyString.length);

    let event: Stripe.Event;

    try {
      const webhookSecret =
        process.env.STRIPE_WEBHOOK_SECRET ||
        "whsec_0FJxMd7eFuSAbBIOQeOjC9Igrms5ATBO";
      if (!webhookSecret) {
        throw new Error(
          "STRIPE_WEBHOOK_SECRET environment variable is not set"
        );
      }

      event = stripe.webhooks.constructEvent(bodyString, sig, webhookSecret);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", {
        message: error.message,
        sig: sig ? `${sig.substring(0, 20)}...` : "undefined",
        bodyLength: bodyString.length,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "not set",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received Stripe webhook:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const { userId } = session.metadata || {};

    if (!userId) {
      console.error("Missing userId in session metadata", {
        sessionId: session.id,
        metadata: session.metadata,
      });
      return;
    }

    // Ensure customer exists with userId in metadata
    if (session.customer) {
      const customer = (await stripe.customers.retrieve(
        session.customer as string
      )) as Stripe.Customer;
      if (!customer.metadata?.userId) {
        // Update customer with userId in metadata
        await stripe.customers.update(session.customer as string, {
          metadata: { userId },
        });
        console.log(
          `Updated customer ${session.customer} with userId metadata`
        );
      }
    }

    // Check if this is a one-time payment (credits purchase) or subscription
    if (session.mode === "payment") {
      // Handle one-time credits purchase
      const planConfig: PlanConfig | undefined = (
        Object.values(PLAN_CONFIGS) as PlanConfig[]
      ).find(
        (config) => config.priceId === session.line_items?.data[0]?.price?.id
      );

      if (planConfig && planConfig.name === "Yetti Credits") {
        // Get current balance and calculate new balance
        const currentBalance = await getCurrentBalance(userId);
        const newBalance = currentBalance + planConfig.credits;

        // Get invoice PDF URL if invoice exists
        let invoiceUrl: string | null = null;
        if (session.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(
              session.invoice as string
            );
            invoiceUrl = invoice.invoice_pdf || null;
          } catch (error) {
            console.error("Error fetching invoice PDF:", error);
          }
        }

        // Create credit transaction via Supabase
        const { error: creditError } = await supabaseAdmin
          .from("user_credits")
          .insert({
            user_id: userId,
            transaction_type: "credit",
            credits: planConfig.credits,
            balance: newBalance,
            description: `Purchased ${planConfig.credits} credits`,
            source: "stripe_checkout",
            invoice: invoiceUrl,
          });

        if (creditError) {
          throw new Error(`Failed to credit credits: ${creditError.message}`);
        }

        console.log(
          `Credited ${planConfig.credits} credits to user ${userId}, new balance: ${newBalance}`
        );
      }
    } else if (session.mode === "subscription") {
      // Handle subscription - this will be handled by the invoice.payment_succeeded event
      console.log(
        "Subscription checkout completed, waiting for invoice payment"
      );
    }
  } catch (error: unknown) {
    console.error("Error in handleCheckoutSessionCompleted:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      sessionId: session?.id,
    });
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      console.log("Invoice without subscription, skipping");
      return;
    }

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    let customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;

    // Check if customer has userId in metadata, if not, try to get it from session
    if (!customer.metadata?.userId) {
      console.error("Missing userId in customer metadata");

      // Try to find checkout session to get userId
      const sessions = await stripe.checkout.sessions.list({
        customer: subscription.customer as string,
        limit: 1,
      });

      if (sessions.data.length > 0 && sessions.data[0].metadata?.userId) {
        // Update customer with userId from session
        customer = (await stripe.customers.update(
          subscription.customer as string,
          {
            metadata: { userId: sessions.data[0].metadata.userId },
          }
        )) as Stripe.Customer;
        console.log(
          `Updated customer ${subscription.customer} with userId from session`
        );
      } else {
        console.error("Could not find userId for customer");
        return;
      }
    }

    const userId = customer.metadata?.userId;

    if (!userId) {
      console.error(
        "Missing userId in customer metadata for subscription payment"
      );
      return;
    }

    // Find the plan configuration based on the price ID
    const priceId = subscription.items.data[0]?.price?.id;
    const planConfig: PlanConfig | undefined = (
      Object.values(PLAN_CONFIGS) as PlanConfig[]
    ).find((config) => config.priceId === priceId);

    if (!planConfig) {
      console.error("Unknown price ID:", priceId);
      return;
    }

    // Get existing plan from Supabase
    const { data: existingPlanData, error: getPlanError } = await supabaseAdmin
      .from("user_plans")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (getPlanError && getPlanError.code !== "PGRST116") {
      console.error("Error fetching plan:", getPlanError);
      throw new Error(`Failed to fetch plan: ${getPlanError.message}`);
    }

    const planData = {
      user_id: userId,
      plan_name: planConfig.name,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: subscription.status === "active" ? "active" : "past_due",
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    };

    if (existingPlanData) {
      // Update existing plan via Supabase
      const { error: updateError } = await supabaseAdmin
        .from("user_plans")
        .update({
          plan_name: planConfig.name,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          status: subscription.status === "active" ? "active" : "past_due",
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("id", existingPlanData.id);

      if (updateError) {
        throw new Error(`Failed to update plan: ${updateError.message}`);
      }
    } else {
      // Create new plan via Supabase
      const { error: createError } = await supabaseAdmin
        .from("user_plans")
        .insert(planData);

      if (createError) {
        throw new Error(`Failed to create plan: ${createError.message}`);
      }
    }

    // Get current balance and calculate new balance
    const currentBalance = await getCurrentBalance(userId);
    const newBalance = currentBalance + planConfig.credits;

    // Get invoice PDF URL
    const invoiceUrl = invoice.invoice_pdf || null;

    // Credit the monthly credits via Supabase
    const { error: creditError } = await supabaseAdmin
      .from("user_credits")
      .insert({
        user_id: userId,
        transaction_type: "credit",
        credits: planConfig.credits,
        balance: newBalance,
        description: `Monthly credits for ${planConfig.name} plan`,
        source: "stripe_subscription",
        invoice: invoiceUrl,
      });

    if (creditError) {
      throw new Error(`Failed to credit credits: ${creditError.message}`);
    }

    console.log(
      `Processed subscription payment for user ${userId}, plan ${planConfig.name}`
    );
  } catch (error: unknown) {
    console.error("Error in handleInvoicePaymentSucceeded:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      invoiceId: invoice?.id,
      subscriptionId: invoice?.subscription,
    });
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("Subscription created:", subscription.id);
  // Additional logic if needed
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;

    if (!customer.metadata?.userId) {
      console.error("Missing userId in customer metadata", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      return;
    }

    // Get plan by stripe subscription ID from Supabase
    const { data: plan, error: getPlanError } = await supabaseAdmin
      .from("user_plans")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    if (getPlanError && getPlanError.code !== "PGRST116") {
      console.error("Error fetching plan:", getPlanError);
      throw new Error(`Failed to fetch plan: ${getPlanError.message}`);
    }

    if (plan) {
      // Update the plan status via Supabase
      const { error: updateError } = await supabaseAdmin
        .from("user_plans")
        .update({
          status:
            subscription.status === "active"
              ? "active"
              : subscription.status === "canceled"
                ? "canceled"
                : "past_due",
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("id", plan.id);

      if (updateError) {
        throw new Error(`Failed to update plan: ${updateError.message}`);
      }

      console.log(
        `Updated subscription ${subscription.id} status to ${subscription.status}`
      );
    }
  } catch (error: unknown) {
    console.error("Error in handleSubscriptionUpdated:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      subscriptionId: subscription?.id,
    });
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;

    if (!customer.metadata?.userId) {
      console.error("Missing userId in customer metadata", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      return;
    }

    // Get plan by stripe subscription ID from Supabase
    const { data: plan, error: getPlanError } = await supabaseAdmin
      .from("user_plans")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    if (getPlanError && getPlanError.code !== "PGRST116") {
      console.error("Error fetching plan:", getPlanError);
      throw new Error(`Failed to fetch plan: ${getPlanError.message}`);
    }

    if (plan) {
      // Update the plan status to canceled via Supabase
      const { error: updateError } = await supabaseAdmin
        .from("user_plans")
        .update({
          status: "canceled",
        })
        .eq("id", plan.id);

      if (updateError) {
        throw new Error(`Failed to cancel plan: ${updateError.message}`);
      }

      console.log(`Canceled subscription ${subscription.id}`);
    }
  } catch (error: unknown) {
    console.error("Error in handleSubscriptionDeleted:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      subscriptionId: subscription?.id,
    });
    throw error;
  }
}
