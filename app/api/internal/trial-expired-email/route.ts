import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Verify internal secret
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { admin_user_id, bot_name, platform } = body;

  if (!admin_user_id || !bot_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Skip if Resend not configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not configured" });
  }

  try {
    // Fetch admin email from Supabase Auth
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(admin_user_id);

    if (userError || !user?.email) {
      return NextResponse.json({ skipped: "No email found for admin" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yetti.ai";

    await resend.emails.send({
      from: "Revolchat <notifications@revolchat.com>",
      to: user.email,
      subject: `A user's trial on "${bot_name}" has expired`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#0F766E;margin-bottom:8px;">Trial Expired</h2>
          <p style="color:#374151;">
            A <strong>${platform ?? "social"}</strong> user's 30-day free trial
            on your bot <strong>"${bot_name}"</strong> has ended.
          </p>
          <p style="color:#374151;">
            We've automatically sent them a payment link in the chat.
            You'll receive another notification when they subscribe.
          </p>
          <div style="margin:24px 0;">
            <a href="${appUrl}/dashboard"
               style="background:#0F766E;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
              View CRM Dashboard
            </a>
          </div>
          <p style="color:#6B7280;font-size:13px;">
            Revolchat — trial expiry notification
          </p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Trial expired email error:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
