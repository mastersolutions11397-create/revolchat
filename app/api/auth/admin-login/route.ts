import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(value: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(value);
  return hmac.digest("hex");
}

function createSignedCookie(payload: { id: string; email: string }) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const data = JSON.stringify({ ...payload, exp: Date.now() + COOKIE_MAX_AGE * 1000 });
  const encoded = Buffer.from(data, "utf-8").toString("base64url");
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("id, email")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) {
      console.error("Admin login DB error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const cookieValue = createSignedCookie({
      id: admin.id,
      email: admin.email ?? "",
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: { id: admin.id, email: admin.email },
    });
  } catch (e) {
    console.error("Admin login error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
