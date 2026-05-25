import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

function embedAuthResponse(request: NextRequest, next: string, accessToken: string, refreshToken: string) {
  const origin = new URL(request.url).origin;
  const fallbackUrl = new URL(next, request.url).toString();
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Authentication complete</title>
  </head>
  <body>
    <script>
      (function () {
        var message = {
          type: "yetti:embed-auth",
          access_token: ${JSON.stringify(accessToken)},
          refresh_token: ${JSON.stringify(refreshToken)}
        };
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, ${JSON.stringify(origin)});
          window.close();
          return;
        }
        window.location.replace(${JSON.stringify(fallbackUrl)});
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const isEmbedOAuth = requestUrl.searchParams.get("embed_oauth") === "1";

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent("Server configuration error. Please contact support.")}`,
        request.url
      )
    );
  }

  // Check if there's an error from Supabase/Google OAuth
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    const errorMessage = errorDescription
      ? encodeURIComponent(errorDescription)
      : encodeURIComponent(`Authentication failed: ${error}`);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${errorMessage}`, request.url)
    );
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      });

      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data.session) {
        if (isEmbedOAuth && next.startsWith("/embed/")) {
          return embedAuthResponse(
            request,
            next,
            data.session.access_token,
            data.session.refresh_token
          );
        }

        // Successfully authenticated (OAuth or email confirmation)
        // User is now logged in, redirect to workspace
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Log the actual error for debugging
      console.error("Error exchanging code for session:", exchangeError);
      const errorMessage = exchangeError?.message
        ? encodeURIComponent(exchangeError.message)
        : "auth_callback_error";
      return NextResponse.redirect(
        new URL(`/auth/login?error=${errorMessage}`, request.url)
      );
    } catch (err) {
      console.error("Unexpected error in callback:", err);
      const errorMessage =
        err instanceof Error
          ? encodeURIComponent(err.message)
          : "auth_callback_error";
      return NextResponse.redirect(
        new URL(`/auth/login?error=${errorMessage}`, request.url)
      );
    }
  }

  // No code and no error - something went wrong
  return NextResponse.redirect(
    new URL("/auth/login?error=auth_callback_error", request.url)
  );
}
