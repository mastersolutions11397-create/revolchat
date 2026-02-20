import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!cookie?.value) {
      return NextResponse.json({ admin: null });
    }
    const admin = verifySignedCookie(cookie.value);
    return NextResponse.json({
      admin: admin ? { id: admin.id, email: admin.email } : null,
    });
  } catch {
    return NextResponse.json({ admin: null });
  }
}
