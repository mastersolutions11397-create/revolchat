import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await request.json();

    console.log("Creating checkout session with data:", {
      priceId,
      userId,
      userEmail,
    });

    if (!priceId || !userId || !userEmail) {
      console.error("Missing required parameters in checkout session request");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if customer already exists for this user
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId: string | undefined;

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      customerId = customer.id;

      // Update customer metadata if needed
      if (!customer.metadata?.userId) {
        await stripe.customers.update(customerId, {
          metadata: { userId },
        });
        console.log(
          `Updated existing customer ${customerId} with userId metadata`
        );
      }
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: customerId, // Use existing customer if available
      customer_email: customerId ? undefined : userEmail, // Only set email if no customer
      metadata: {
        userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing/cancel`,
    });

    console.log("Checkout session created successfully:", {
      sessionId: session.id,
      mode: session.mode,
      payment_status: session.payment_status,
      customerId: customerId || "new customer will be created",
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
