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
 * Get headers with Authorization bearer token
 */
async function getAuthHeaders() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
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
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown;
    try {
      errorData = await response.json();
      const detail = (errorData && (errorData.detail ?? errorData.message ?? errorData.error));
      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail
          .map((d) => (typeof d === "string" ? d : JSON.stringify(d)))
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
