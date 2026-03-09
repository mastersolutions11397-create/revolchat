import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the current Supabase JWT token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Get headers with optional Authorization bearer token.
 * When user is logged in via admins table (cookie only), there is no Supabase token;
 * requests are still sent so same-origin APIs that use cookies can authenticate.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

class ApiRequestError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(
    message: string,
    {
      status,
      statusText,
      data,
    }: { status: number; statusText: string; data?: unknown }
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Use same-origin for local API routes; external base for rest.
 */
function getBaseUrl(endpoint: string): string {
  if (endpoint.startsWith("/api/yetti/") && !endpoint.includes("workspaces/")) {
    return "";
  }
  if (endpoint.startsWith("/api/trigger-words")) {
    return "";
  }
  if (endpoint.startsWith("/api/chat/")) {
    return "";
  }
  return API_BASE_URL;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const base = getBaseUrl(endpoint);

  const url = `${base}${endpoint}`;
  const isSameOrigin = typeof window !== "undefined" && !base;
  const response = await fetch(url, {
    ...options,
    credentials: isSameOrigin ? "include" : options.credentials,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: any;
    try {
      errorData = await response.json();
      const detail = (errorData && (errorData.detail ?? errorData.message ?? errorData.error));
      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail
          .map((d: any) => (typeof d === "string" ? d : JSON.stringify(d)))
          .join(", ");
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData) {
        errorMessage = JSON.stringify(errorData);
      } else {
        errorMessage = response.statusText || errorMessage;
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    // 401 Unauthorized: clear admin session and redirect to login
    if (response.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname ?? "";
      if (!pathname.startsWith("/auth/")) {
        await fetch("/api/auth/admin-logout", { method: "POST" });
        window.location.href = "/auth/login";
      }
    }

    throw new ApiRequestError(errorMessage, {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  if (options.method === "HEAD") {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text as unknown as T;
  }

  return response.json();
}

export {
  API_BASE_URL,
  ApiRequestError,
  getAuthToken,
  getAuthHeaders,
  apiRequest,
};
