import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

const getSupabaseAdmin = (): SupabaseClient => {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    // During build time, return a mock client to prevent build failures
    if (process.env.NODE_ENV === "production" && !serviceKey) {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY not set - using mock client for build"
      );
      return {} as SupabaseClient;
    }
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!serviceKey) {
    // During build time, return a mock client to prevent build failures
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY not set - using mock client for build"
      );
      return {} as SupabaseClient;
    }
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  _supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
};

// Create a Proxy that properly forwards all properties and methods
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    // Use type assertion to 'unknown' and then 'SupabaseClient' to avoid 'any'
    const value = (client as SupabaseClient)[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
}) as SupabaseClient;
