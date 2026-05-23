"use client";

import Link from "next/link";
import { useState } from "react";
import { authService } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await authService.resetPassword(email);
    if (error) setError(error.message);
    else setMessage("Password reset link sent. Check your email.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d6159] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email and we will send a reset link.</p>
        {message && <div className="mt-5 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" />
          <button disabled={loading} className="w-full rounded-xl bg-teal-primary px-4 py-3 text-sm font-bold text-white hover:bg-teal-accent disabled:opacity-70">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link href="/auth/login" className="mt-5 block text-center text-sm font-semibold text-teal-primary hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}
