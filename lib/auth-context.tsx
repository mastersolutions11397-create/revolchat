"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

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
    const res = await fetch("/api/auth/admin-session");
    const json = await res.json().catch(() => ({}));
    if (json?.admin && typeof json.admin.id === "string" && typeof json.admin.email === "string") {
      setUser({ id: json.admin.id, email: json.admin.email, user_metadata: {} });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signOut = async () => {
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
