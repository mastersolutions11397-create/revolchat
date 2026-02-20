"use client";

/**
 * Auth is admins-table only. Login via /api/auth/admin-login (cookie).
 */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

export const authService = {
  async signIn(email: string, password: string, _rememberMe?: boolean) {
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        json?.error ?? (res.status === 401 ? "Invalid email or password" : "Login failed");
      return { data: null, error: { message } };
    }

    if (!json.success || !json.user) {
      return { data: null, error: { message: "Invalid response from server" } };
    }

    return {
      data: {
        user: { id: json.user.id, email: json.user.email },
      },
      error: null,
    };
  },

  async signOut() {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    return { error: null };
  },
};
