"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand/30 blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-brand-light/20 blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="w-full sm:max-w-5xl bg-surface rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10 animate-fade-in-up my-auto">

        {/* Left: Form */}
        <div className="p-4 sm:p-6 md:p-10">
          <Link href="/" className="inline-block mb-8 hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <Image src="/yetti/logo2.jpg" alt="BotHub" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="mt-1 text-sm text-text-muted">Start by creating your login. Your workspace comes next.</p>
          </div>

          {/* Feedback banners */}
          {message && (
            <div role="status" className="mb-4 p-3 bg-success-bg border border-success-border rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-success-text text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-error-bg border border-error-border rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-error-text text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand hover:bg-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-brand hover:text-brand-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Right: Visual panel */}
        <div className="relative hidden lg:flex flex-col items-center justify-center bg-brand overflow-hidden p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-dark" aria-hidden="true">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-brand-light/20 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-brand-light/20 blur-3xl animate-pulse-slow delay-1000" />
          </div>

          <div className="relative z-10 text-center text-white">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20">
              <Image src="/yetti/logo2.jpg" alt="BotHub" width={48} height={48} className="object-contain rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your AI agent awaits</h2>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Set up in minutes. Connect Instagram, Telegram, and more. Let your AI handle every conversation while you focus on growing.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {[
                "Connect your social channels",
                "Train your AI on your business",
                "Go live and automate replies",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-white/85">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
