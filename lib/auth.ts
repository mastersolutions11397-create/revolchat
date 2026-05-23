"use client";

import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

export const authService = {
  async signIn(email: string, password: string, _rememberMe?: boolean) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { data: null, error: { message: error.message } };
    if (!data.user?.email) return { data: null, error: { message: "Invalid response from server" } };
    return { data: { user: { id: data.user.id, email: data.user.email } }, error: null };
  },

  async signUp(email: string, password: string, metadata?: Record<string, string>) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/dashboard`
        : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: redirectTo },
    });
    if (error) return { data: null, error: { message: error.message } };
    return { data, error: null };
  },

  async resetPassword(email: string) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error: error ? { message: error.message } : null };
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? { message: error.message } : null };
  },

  async signOut() {
    await supabase.auth.signOut();
    await fetch("/api/auth/admin-logout", { method: "POST" });
    return { error: null };
  },
};
