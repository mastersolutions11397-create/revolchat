import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { ADMIN_COOKIE_NAME, verifySignedCookie } from "@/lib/admin-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      });
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        return NextResponse.json({
          admin: { id: data.user.id, email: data.user.email },
        });
      }
    }
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
