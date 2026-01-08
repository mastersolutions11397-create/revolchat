import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Send email notification for cashout request
 * This is the only API endpoint needed (for server-side email sending)
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Email not configured" }, { status: 500 });
    }

    const body = await request.json();
    const {
      cashoutRequestId,
      userId,
      userEmail,
      referralCode,
      totalAmount,
      paymentMethod,
      paymentDetails,
      commissionIds,
      commissionCount,
    } = body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Determine email content based on whether it's a simple request or detailed request
    const isSimpleRequest = !paymentMethod && !paymentDetails;

    if (isSimpleRequest) {
      // Simple cashout request - just user wants to cash out
      await resend.emails.send({
        from: "yetti AI <onboarding@resend.dev>",
        to: "info@yetti.ai",
        subject: `Cashout Request - $${totalAmount.toFixed(2)} from ${userEmail}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5170ff;">New Cashout Request</h2>
            <p>A user wants to cash out their referral earnings.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User Email:</strong> ${userEmail || "N/A"}</p>
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Referral Code:</strong> ${referralCode || "N/A"}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Number of Commissions:</strong> ${commissionCount || commissionIds?.length || 0}</p>
            </div>
            <p style="margin-top: 20px;">
              <strong>Contact Information:</strong><br>
              Email: <a href="mailto:${userEmail}">${userEmail}</a>
            </p>
            <p style="margin-top: 20px; color: #666;">
              Please contact the user to process their cashout request.
            </p>
          </div>
        `,
      });
    } else {
      // Detailed cashout request with payment method
      await resend.emails.send({
        from: "yetti AI <onboarding@resend.dev>",
        to: "info@yetti.ai",
        subject: `New Referral Cashout Request - $${totalAmount.toFixed(2)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5170ff;">New Referral Cashout Request</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${cashoutRequestId ? `<p><strong>Request ID:</strong> ${cashoutRequestId}</p>` : ""}
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>User Email:</strong> ${userEmail || "N/A"}</p>
              <p><strong>Referral Code:</strong> ${referralCode || "N/A"}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Number of Commissions:</strong> ${commissionIds?.length || 0}</p>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
              <h3 style="color: #333;">Payment Details:</h3>
              <pre style="color: #666; white-space: pre-wrap;">${JSON.stringify(paymentDetails, null, 2)}</pre>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 20px;">
              <h3 style="color: #333;">Commission IDs:</h3>
              <p style="color: #666;">${commissionIds?.join(", ") || "N/A"}</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending cashout email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}

