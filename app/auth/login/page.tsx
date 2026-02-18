"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const router = useRouter();

  // Load remember me preference on mount and check for error/success in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRememberMe = localStorage.getItem("rememberMe") === "true";
      setRememberMe(savedRememberMe);

      // Check for error or success message in URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get("error");
      const urlMessage = urlParams.get("message");
      const redirect = urlParams.get("redirect");

      // Store redirect URL if present
      if (redirect) {
        setRedirectUrl(decodeURIComponent(redirect));
      }

      if (urlError) {
        // Decode the error message if it's URL encoded
        try {
          const decodedError = decodeURIComponent(urlError);
          if (decodedError === "auth_callback_error") {
            setError("Authentication failed. Please try again.");
          } else {
            // Show the actual error message from the callback
            setError(
              decodedError || "An error occurred during authentication."
            );
          }
        } catch {
          // If decoding fails, use the original error
          if (urlError === "auth_callback_error") {
            setError("Authentication failed. Please try again.");
          } else {
            setError("An error occurred during authentication.");
          }
        }
        // Clean up URL
        router.replace("/auth/login");
      } else if (urlMessage) {
        // Show success message
        try {
          const decodedMessage = decodeURIComponent(urlMessage);
          setSuccessMessage(decodedMessage);
        } catch {
          setSuccessMessage("Operation completed successfully!");
        }
        // Clean up URL
        router.replace("/auth/login");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authService.signIn(
        email,
        password,
        rememberMe
      );

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Redirect to the specified URL or default to dashboard
        router.push(redirectUrl || "/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d6159] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-teal-primary/30 to-teal-accent/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-teal-accent/20 to-teal-primary/30 blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="w-full max-w-5xl bg-dashboard-card rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10 animate-fade-in-up">
        {/* Left: Header + Form */}
        <div className="p-6 md:p-10">
          <div className="mb-6 text-left">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/yetti/logo2.jpg"
                alt="Admin"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <div>
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-green-600 text-xs font-medium">
                  {successMessage}
                </p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
                >
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
                  className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
                  >
                    {t("login.password")}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-teal-primary hover:text-teal-accent font-medium transition-colors"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer h-4 w-4 rounded border-dashboard-border text-teal-primary focus:ring-teal-primary cursor-pointer transition-all"
                    />
                  </div>
                  <span className="group-hover:text-slate-900 transition-colors text-xs">
                    {t("login.rememberMe")}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-primary hover:bg-teal-accent text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-teal-primary/25 hover:shadow-teal-accent/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("login.signingIn")}
                  </span>
                ) : (
                  t("login.signIn")
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="relative hidden lg:block bg-teal-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-primary to-[#0d6159]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-teal-accent/20 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-teal-accent/20 blur-3xl animate-pulse-slow delay-1000" />
          </div>

          <div className="relative h-full flex items-center justify-center p-8">
            <div className="relative w-full max-w-[320px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-accent/20 to-teal-primary/30 rounded-full blur-2xl animate-pulse-slow" />
              <Image
                src="/yetti/logo2.jpg"
                alt="Admin"
                fill
                className="object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
