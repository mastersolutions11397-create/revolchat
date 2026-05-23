"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setReady(true);
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(error.message);
      setReady(true);
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await authService.updatePassword(password);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/auth/login?message=Password%20updated.%20Please%20sign%20in.");
  };

  return (
    <div className="min-h-screen bg-[#0d6159] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
        {error && <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" />
          <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" />
          <button disabled={loading || !ready} className="w-full rounded-xl bg-teal-primary px-4 py-3 text-sm font-bold text-white hover:bg-teal-accent disabled:opacity-70">
            {!ready ? "Preparing..." : loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
