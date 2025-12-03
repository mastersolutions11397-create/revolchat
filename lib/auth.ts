"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

export interface AuthError {
  message: string;
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    userData?: { firstName?: string; lastName?: string; company?: string }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          full_name:
            userData?.firstName && userData?.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : undefined,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string, rememberMe?: boolean) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Store preference for future sessions
    if (rememberMe !== undefined) {
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
      }
    }

    return { data, error };
  },

  async signInWithGoogle() {
    try {
      // Get the current origin, handling both client and server environments
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const redirectTo = `${origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error in signInWithGoogle:", err);
      return {
        data: null,
        error:
          err instanceof Error
            ? err
            : new Error("Failed to initiate Google sign-in"),
      };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },
};
