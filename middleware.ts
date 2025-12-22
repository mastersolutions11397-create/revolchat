import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);

  // Only process dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Check if ws parameter is already present
  const wsParam = searchParams.get("ws");
  if (wsParam && wsParam !== "undefined" && wsParam !== "null") {
    return NextResponse.next();
  }

  // Get Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, let the request proceed
    // Client-side code will handle workspace selection
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // User not authenticated, let the request proceed
    // ProtectedRoute will handle redirect to login
    return NextResponse.next();
  }

  // User is authenticated, fetch workspaces from Supabase
  try {
    const userId = session.user.id;

    // Query workspaces from Supabase directly
    // Try owner_id first (most common), fallback to user_id if it exists
    const { data: workspaces, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, owner_id, user_id, created_at")
      .or(`owner_id.eq.${userId},user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (workspaceError) {
      console.error("Error fetching workspaces from Supabase:", workspaceError);
      // Let request proceed - client-side code will handle workspace selection
      return NextResponse.next();
    }

    if (workspaces && workspaces.length > 0) {
      const workspaceId = workspaces[0].id;

      if (workspaceId) {
        // Redirect with ws parameter
        const url = new URL(request.url);
        url.searchParams.set("ws", workspaceId);

        // Create redirect response and set cookie
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.set({
          name: "selectedWorkspaceId",
          value: workspaceId,
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        return redirectResponse;
      }
    }
  } catch (error) {
    // If database query fails, log error but let request proceed
    // Client-side code will handle workspace selection
    console.error(
      "Failed to fetch workspaces from Supabase in middleware:",
      error
    );
  }

  // If we can't get workspace, let the request proceed
  // Client-side code in DashboardShell will handle it
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|auth).*)",
  ],
};
