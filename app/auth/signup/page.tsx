"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data, error } = await authService.signUp(email, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName} ${lastName}`.trim(),
      });
      if (error) {
        setError(error.message);
      } else if (data?.session) {
        router.push("/dashboard");
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#0d6159] relative flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-primary/30 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-teal-accent/20 blur-[100px]" />
      </div>

      <div className="w-full sm:max-w-5xl bg-dashboard-card rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10">
        <div className="p-4 sm:p-6 md:p-10">
          <Link href="/" className="inline-block mb-8">
            <Image src="/yetti/logo2.jpg" alt="Admin" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Start by creating your login. Your workspace comes next.</p>
          </div>

          {message && <div className="mb-4 rounded-lg border border-green-100 bg-green-50 p-3 text-xs font-medium text-green-700">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2.5 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2.5 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2.5 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2.5 text-sm outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20" placeholder="Minimum 6 characters" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-teal-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-primary/25 transition-all hover:bg-teal-accent disabled:opacity-70">
              {loading ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account? <Link href="/auth/login" className="font-semibold text-teal-primary hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="relative hidden lg:flex items-center justify-center bg-teal-primary p-8">
          <Image src="/yetti/logo2.jpg" alt="Admin" width={320} height={320} className="object-contain drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
