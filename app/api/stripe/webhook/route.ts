import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { PLAN_CONFIGS, PlanConfig } from "@/lib/stripe";
import Stripe from "stripe";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to get current balance
async function getCurrentBalance(userId: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/credits?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Convert credits from string to number since it's stored as text
      return parseInt(data.credits || "0", 10);
    }
    return 0;
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

        // Create credit transaction via API
        const response = await fetch(
          `${API_BASE_URL}/api/credits/transaction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              transaction_type: "credit",
              credits: planConfig.credits.toString(),
              balance: newBalance.toString(),
              description: `Purchased ${planConfig.credits} credits`,
              source: "stripe_checkout",
              invoice: session.invoice
                ? `https://dashboard.stripe.com/invoices/${session.invoice}`
                : undefined,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to credit credits: ${await response.text()}`);
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

    // Get existing plan via API
    const getPlanResponse = await fetch(
      `${API_BASE_URL}/api/billing/plan?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let existingPlan = null;
    if (getPlanResponse.ok) {
      const data = await getPlanResponse.json();
      existingPlan = data.plan;
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

    if (existingPlan) {
      // Update existing plan via API
      const updateResponse = await fetch(
        `${API_BASE_URL}/api/billing/plan/${existingPlan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customer.id,
            status: subscription.status === "active" ? "active" : "past_due",
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update plan: ${await updateResponse.text()}`
        );
      }
    } else {
      // Create new plan via API
      const createResponse = await fetch(`${API_BASE_URL}/api/billing/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create plan: ${await createResponse.text()}`
        );
      }
    }

    // Get current balance and calculate new balance
    const currentBalance = await getCurrentBalance(userId);
    const newBalance = currentBalance + planConfig.credits;

    // Credit the monthly credits via API
    const creditResponse = await fetch(
      `${API_BASE_URL}/api/credits/transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          transaction_type: "credit",
          credits: planConfig.credits.toString(),
          balance: newBalance.toString(),
          description: `Monthly credits for ${planConfig.name} plan`,
          source: "stripe_subscription",
          invoice: `https://dashboard.stripe.com/invoices/${invoice.id}`,
        }),
      }
    );

    if (!creditResponse.ok) {
      throw new Error(
        `Failed to credit credits: ${await creditResponse.text()}`
      );
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

    // Get plan by stripe subscription ID via API
    const getPlanResponse = await fetch(
      `${API_BASE_URL}/api/billing/plan/stripe/${subscription.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (getPlanResponse.ok) {
      const data = await getPlanResponse.json();
      const plan = data.plan;

      if (plan) {
        // Update the plan status via API
        const updateResponse = await fetch(
          `${API_BASE_URL}/api/billing/plan/${plan.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to update plan: ${await updateResponse.text()}`
          );
        }

        console.log(
          `Updated subscription ${subscription.id} status to ${subscription.status}`
        );
      }
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

    // Get plan by stripe subscription ID via API
    const getPlanResponse = await fetch(
      `${API_BASE_URL}/api/billing/plan/stripe/${subscription.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (getPlanResponse.ok) {
      const data = await getPlanResponse.json();
      const plan = data.plan;

      if (plan) {
        // Update the plan status to canceled via API
        const updateResponse = await fetch(
          `${API_BASE_URL}/api/billing/plan/${plan.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "canceled",
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to cancel plan: ${await updateResponse.text()}`
          );
        }

        console.log(`Canceled subscription ${subscription.id}`);
      }
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
