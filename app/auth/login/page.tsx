"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { setUserFromAdminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRememberMe = localStorage.getItem("rememberMe") === "true";
      setRememberMe(savedRememberMe);

      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get("error");
      const urlMessage = urlParams.get("message");
      const redirect = urlParams.get("redirect");

      if (redirect) setRedirectUrl(decodeURIComponent(redirect));

      if (urlError) {
        try {
          const decoded = decodeURIComponent(urlError);
          setError(decoded === "auth_callback_error"
            ? "Authentication failed. Please try again."
            : decoded || "An error occurred during authentication.");
        } catch {
          setError("An error occurred during authentication.");
        }
        router.replace("/auth/login");
      } else if (urlMessage) {
        try {
          setSuccessMessage(decodeURIComponent(urlMessage));
        } catch {
          setSuccessMessage("Operation completed successfully!");
        }
        router.replace("/auth/login");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authService.signIn(email, password, rememberMe);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setUserFromAdminLogin({ id: data.user.id, email: data.user.email });
        router.push(redirectUrl || "/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-[100vw] bg-[#0d6159] relative flex items-center justify-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-teal-primary/30 to-teal-accent/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-teal-accent/20 to-teal-primary/30 blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="w-full max-w-[100vw] sm:max-w-5xl bg-surface rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10 animate-fade-in-up my-auto">

        {/* Left: Form */}
        <div className="p-4 sm:p-6 md:p-10">
          <div className="mb-6">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity" aria-label="Go to homepage">
              <Image
                src="/yetti/logo2.jpg"
                alt="Revolchat"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in to your account to continue.</p>
          </div>

          {/* Feedback banners */}
          {successMessage && (
            <div role="status" className="mb-4 p-3 bg-success-bg border border-success-border rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-success-text text-sm">{successMessage}</p>
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-error-bg border border-error-border rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-error-text text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                {t("login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background text-text-primary placeholder:text-text-placeholder border border-border focus:ring-2 focus:ring-brand/25 focus:border-brand transition-all outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t("login.password")}
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-brand hover:text-brand-light font-medium transition-colors">
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-background text-text-primary placeholder:text-text-placeholder border border-border focus:ring-2 focus:ring-brand/25 focus:border-brand transition-all outline-none text-sm"
                  placeholder="Enter your password"
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

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand cursor-pointer transition-all"
                />
                <span className="text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                  {t("login.rememberMe")}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("login.signingIn")}
                </span>
              ) : t("login.signIn")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-text-muted">
            New here?{" "}
            <Link href="/auth/signup" className="font-semibold text-brand hover:text-brand-light transition-colors">
              Create an account
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
              <Image src="/yetti/logo2.jpg" alt="Revolchat" width={48} height={48} className="object-contain rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Automate your conversations</h2>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Connect your AI agent to Instagram, Telegram, and more. Reply to every customer, 24/7 — without lifting a finger.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[["24/7", "Always on"], ["2 min", "Setup time"], ["100%", "Automated"]].map(([stat, label]) => (
                <div key={label} className="bg-white/10 rounded-xl p-3 ring-1 ring-white/10">
                  <div className="text-lg font-bold">{stat}</div>
                  <div className="text-xs text-white/60 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
