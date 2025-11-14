"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function SignupPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authService.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
        }
      );

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(true);
        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0b1220] to-[#0f1a3a] py-10 px-4">
        <div className="w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-2xl text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900">
              YETTI<span className="text-gray-400">.AI</span>
            </span>
          </Link>
          <div className="mt-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-6">Please check your email to verify your account before signing in.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-[#0b1220] to-[#0f1a3a]">
      <div className="w-full max-w-6xl rounded-[32px] bg-white p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left - Header + Form */}
          <div className="p-6 md:p-10">
            <div className="text-left mb-6">
              <Link href="/" className="inline-block">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                  YETTI<span className="text-gray-400">.AI</span>
                </span>
              </Link>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">{t("signup.createAccount")}</h2>
              <p className="mt-1 text-sm text-gray-600">{t("signup.startTrial")}</p>
            </div>

            <div className="rounded-2xl p-0">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("signup.firstName")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring- sky-500 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("signup.lastName")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring- sky-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("signup.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring- sky-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("signup.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring- sky-500 focus:border-transparent transition-all"
                placeholder="Create a strong password"
              />
            </div>

            

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text- sky-600 focus:ring- sky-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text- sky-600 hover:text- sky-500 font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text- sky-600 hover:text- sky-500 font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors   disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t("signup.creatingAccount") : t("signup.createAccountButton")}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {t("signup.haveAccount")}{" "}
                <Link
                  href="/auth/login"
                  className="text- sky-600 hover:text- sky-500 font-medium"
                >
                  {t("signup.signIn")}
                </Link>
              </span>
            </div>
          </form>

            {/* Social Signup */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t("signup.orContinueWith")}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button 
                  type="button"
                  onClick={async () => {
                    setGoogleLoading(true);
                    setError("");
                    try {
                      const { error } = await authService.signInWithGoogle();
                      if (error) {
                        setError(error.message);
                        setGoogleLoading(false);
                      }
                    } catch {
                      setError("An unexpected error occurred");
                      setGoogleLoading(false);
                    }
                  }}
                  disabled={googleLoading || loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>{googleLoading ? t("signup.signingUp") : "Google"}</span>
                </button>
              </div>
            </div>
          </div>
          </div>
          {/* Right - Visual */}
          <div className="p-4 md:p-6">
            <div className="h-full w-full rounded-[28px] bg-white p-2">
              <div className="relative h-full rounded-2xl overflow-hidden bg-[radial-gradient(1200px_600px_at_60%_-20%,#0ea5e9_0%,#0b1220_60%)]">
                <Image src="/yetti/yetti_posing_for_a_pic.png" alt="Yetti posing" fill className="object-contain p-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
