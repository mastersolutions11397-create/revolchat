"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";

export interface AppUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    company?: string;
    phone?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUserFromAdminLogin: (admin: { id: string; email: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (supabaseUser?.email) {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        user_metadata: supabaseUser.user_metadata ?? {},
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = (await response.json()) as {
          user?: AppUser | null;
        };
        if (data.user?.email) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to logged-out state.
    }

    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function initializeSession() {
      await refreshSession();
    }

    void initializeSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser?.email) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          user_metadata: sessionUser.user_metadata ?? {},
        });
    } else {
        void refreshSession();
        return;
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/admin-logout", { method: "POST" });
    setUser(null);
  };

  const setUserFromAdminLogin = useCallback((admin: { id: string; email: string }) => {
    setUser({ id: admin.id, email: admin.email, user_metadata: {} });
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    signOut,
    refreshSession,
    setUserFromAdminLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
