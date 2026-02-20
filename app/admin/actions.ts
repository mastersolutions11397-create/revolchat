"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USER = "admin";
const ADMIN_PASS = "yetti2024";
const COOKIE_NAME = "admin_session";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid credentials" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}

export async function approveCashout(requestId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has(COOKIE_NAME))
    return { success: false, error: "Unauthorized" };

  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // Get request details
    const { data: request, error: reqError } = await supabaseAdmin
      .from("referral_cashout_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqError) throw reqError;
    if (request.status !== "pending")
      return { success: false, error: "Request not pending" };

    // Update request status
    const { error: updateError } = await supabaseAdmin
      .from("referral_cashout_requests")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Update commissions status
    if (request.commission_ids && request.commission_ids.length > 0) {
      await supabaseAdmin
        .from("referral_commissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .in("id", request.commission_ids);

      // Recalculate if needed
    }

    // Send Email Notification
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Get user email from payment_details or auth
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(
        request.user_id,
      );
      const userEmail = request.payment_details?.email || user?.user?.email;

      if (userEmail) {
        await resend.emails.send({
          from: "yetti AI <support@yetti.ai>", // Or configured domain
          to: userEmail,
          subject: "Cashout Request Approved",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Cashout Approved!</h2>
              <p>Great news! Your cashout request for <strong>$${request.total_amount}</strong> has been approved and processed.</p>
              <p>The funds should appear in your account shortly.</p>
              <br/>
              <p>Thank you for being a valued partner!</p>
              <p>- The Yetti AI Team</p>
            </div>
          `,
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error approving cashout:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCashout(requestId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has(COOKIE_NAME))
    return { success: false, error: "Unauthorized" };

  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // Update request status
    const { error: updateError } = await supabaseAdmin
      .from("referral_cashout_requests")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Revert commissions
    const { data: request } = await supabaseAdmin
      .from("referral_cashout_requests")
      .select("commission_ids")
      .eq("id", requestId)
      .single();

    if (request?.commission_ids) {
      await supabaseAdmin
        .from("referral_commissions")
        .update({ status: "pending", cashout_requested_at: null })
        .in("id", request.commission_ids);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
