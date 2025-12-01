import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only return safe, non-sensitive session data
    const safeSessionData = {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      line_items: session.line_items?.data?.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount_total: item.amount_total,
        price: {
          id: item.price?.id,
          unit_amount: item.price?.unit_amount,
        },
      })),
    };

    return NextResponse.json({ session: safeSessionData });
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session details" },
      { status: 500 }
    );
  }
}

