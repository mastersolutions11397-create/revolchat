import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, subject, message, inquiryType } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email to the company
    const { data, error } = await resend.emails.send({
      from: "yetti AI <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "hello@yettiai.com",
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5170ff;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
            <p><strong>Inquiry Type:</strong> ${inquiryType || "General"}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="color: #666; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    await resend.emails.send({
      from: "yetti AI <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for contacting yetti AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5170ff;">Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p>Your inquiry: <strong>${subject}</strong></p>
          <p>Best regards,<br>The yetti AI Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
