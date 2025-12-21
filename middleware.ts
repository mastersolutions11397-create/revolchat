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

  // Get workspace ID from cookie first (fastest option)
  const workspaceIdFromCookie = request.cookies.get(
    "selectedWorkspaceId"
  )?.value;
  if (
    workspaceIdFromCookie &&
    workspaceIdFromCookie !== "undefined" &&
    workspaceIdFromCookie !== "null"
  ) {
    const url = new URL(request.url);
    url.searchParams.set("ws", workspaceIdFromCookie);
    // Use rewrite instead of redirect to avoid extra round trip
    // But since we're adding a query param, we need to redirect
    return NextResponse.redirect(url);
  }

  // If no cookie, try to get workspace from API
  // First, check if user is authenticated
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, let the request proceed
    // Client-side code will handle workspace selection
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(
        name: string,
        value: string,
        options?: {
          path?: string;
          maxAge?: number;
          sameSite?: "strict" | "lax" | "none";
          secure?: boolean;
        }
      ) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(
        name: string,
        options?: {
          path?: string;
          maxAge?: number;
          sameSite?: "strict" | "lax" | "none";
          secure?: boolean;
        }
      ) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
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

  // User is authenticated, fetch workspaces
  try {
    const accessToken = session.access_token;
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const workspacesResponse = await fetch(
      `${API_BASE_URL}/api/yetti/workspaces`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (workspacesResponse.ok) {
      const data = await workspacesResponse.json();
      const workspaces = data.workspaces || [];

      if (workspaces.length > 0) {
        // Get the most recent workspace (first one in the list)
        // The API typically returns workspaces sorted by most recent first
        const mostRecentWorkspaceId = workspaces[0].id;

        if (mostRecentWorkspaceId) {
          // Redirect with ws parameter
          const url = new URL(request.url);
          url.searchParams.set("ws", mostRecentWorkspaceId);

          // Create redirect response and set cookie
          const redirectResponse = NextResponse.redirect(url);
          redirectResponse.cookies.set({
            name: "selectedWorkspaceId",
            value: mostRecentWorkspaceId,
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });

          return redirectResponse;
        }
      }
    }
  } catch (error) {
    // If API call fails, log error but let request proceed
    // Client-side code will handle workspace selection
    console.error("Failed to fetch workspaces in middleware:", error);
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
