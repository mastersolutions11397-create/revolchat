import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Send welcome email to subscriber
    await resend.emails.send({
      from: "yetti AI <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to yetti AI Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5170ff;">Welcome to yetti AI!</h2>
          <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
          <ul>
            <li>New features and integrations</li>
            <li>AI agent best practices</li>
            <li>Tips and tutorials</li>
            <li>Product announcements</li>
          </ul>
          <p>We're excited to have you on board!</p>
          <p>Best regards,<br>The yetti AI Team</p>
        </div>
      `,
    });

    // Notify admin about new subscriber
    await resend.emails.send({
      from: "yetti AI <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "hello@yettiai.com",
      subject: "New Newsletter Subscriber",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Newsletter Subscriber</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
