"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/utils/referral-code";

export default function SignupPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState<string | null>(
    null
  );
  const router = useRouter();

  // Extract redirect and referral parameters from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");
      const ref = urlParams.get("ref");

      if (redirect) {
        setRedirectUrl(decodeURIComponent(redirect));
      }

      if (ref) {
        setReferralCodeFromUrl(ref.toUpperCase());
        setFormData((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
        // Store in localStorage as backup
        localStorage.setItem("referral_code", ref.toUpperCase());
      } else {
        // Check localStorage for referral code
        const storedRef = localStorage.getItem("referral_code");
        if (storedRef) {
          setReferralCodeFromUrl(storedRef);
          setFormData((prev) => ({ ...prev, referralCode: storedRef }));
        }
      }
    }
  }, []);

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
        // Ensure user profile exists and link referral if code exists
        try {
          console.log(
            "Setting up profile and referral for user:",
            data.user.id
          );

          // First, ensure the new user has a profile with referral code
          let { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", data.user.id)
            .maybeSingle();

          console.log("Existing profile check:", { userProfile, profileError });

          // If profile doesn't exist, create it (fallback if trigger didn't work)
          if (!userProfile && !profileError) {
            console.log("Creating new profile for user");

            const username =
              formData.firstName && formData.lastName
                ? `${formData.firstName}${formData.lastName}`
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase()
                : data.user.email?.split("@")[0]?.toUpperCase() || "USER";

            let referralCode = generateReferralCode(username);

            // Ensure uniqueness
            let attempts = 0;
            while (attempts < 10) {
              const { data: existing } = await supabase
                .from("user_profiles")
                .select("referral_code")
                .eq("referral_code", referralCode)
                .maybeSingle();

              if (!existing) break;
              referralCode = generateReferralCode(username);
              attempts++;
            }

            console.log("Generated referral code:", referralCode);

            const { data: newProfile, error: createError } = await supabase
              .from("user_profiles")
              .insert({
                user_id: data.user.id,
                referral_code: referralCode,
                total_earnings: 0,
                total_referrals: 0,
              })
              .select()
              .single();

            console.log("Profile creation result:", {
              newProfile,
              createError,
            });

            if (!createError) {
              userProfile = newProfile;
            } else {
              console.error("Failed to create profile:", createError);
            }
          }

          // Now link referral if code exists
          const codeToUse =
            formData.referralCode?.trim().toUpperCase() || referralCodeFromUrl;
          if (codeToUse && userProfile) {
            // Find the referrer by referral code
            const { data: referrerProfile } = await supabase
              .from("user_profiles")
              .select("user_id")
              .eq("referral_code", codeToUse)
              .maybeSingle();

            if (referrerProfile && referrerProfile.user_id !== data.user.id) {
              // Check if user already has a referral
              const { data: existingReferral } = await supabase
                .from("referrals")
                .select("id")
                .eq("referee_id", data.user.id)
                .maybeSingle();

              if (!existingReferral) {
                // Create referral relationship
                await supabase.from("referrals").insert({
                  referrer_id: referrerProfile.user_id,
                  referee_id: data.user.id,
                  referral_code: codeToUse,
                  status: "pending",
                });
              }
            }
            // Clear stored referral code
            localStorage.removeItem("referral_code");
          }
        } catch (err) {
          console.error("Failed to set up user profile and referral:", err);
          // Don't block signup if profile/referral setup fails
        }

        setSuccess(true);
        // Redirect to specified URL or dashboard after successful signup
        setTimeout(() => {
          router.push(redirectUrl || "/dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-primary to-[#0d6159] py-10 px-4">
        <div className="w-full max-w-2xl rounded-[28px] bg-dashboard-card p-8 shadow-2xl text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              Yetti<span className="text-teal-primary">.ai</span>
            </span>
          </Link>
          <div className="mt-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome! Taking you to your dashboard...
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                Yetti<span className="text-teal-primary">.ai</span>
              </span>
            </Link>
          </div>

          <div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
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
                    className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
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
                    className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
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
                  className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
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
                  className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
                >
                  Referral Code{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-dashboard-bg text-slate-900 placeholder:text-slate-400 border border-dashboard-border focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all outline-none text-sm uppercase"
                  placeholder="Enter referral code (optional)"
                  style={{ textTransform: "uppercase" }}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Have a referral code? Enter it here to support the person who
                  referred you.
                </p>
              </div>

              <div className="flex items-start pt-1">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="peer h-4 w-4 rounded border-dashboard-border text-teal-primary focus:ring-teal-primary cursor-pointer transition-all"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 text-xs text-slate-600">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-teal-primary hover:text-teal-accent font-medium hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-teal-primary hover:text-teal-accent font-medium hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-primary hover:bg-teal-accent text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-teal-primary/25 hover:shadow-teal-accent/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
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
                    {t("signup.creatingAccount")}
                  </span>
                ) : (
                  t("signup.createAccountButton")
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500 text-xs">
                  {t("signup.haveAccount")}{" "}
                  <Link
                    href={
                      redirectUrl
                        ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
                        : "/auth/login"
                    }
                    className="text-teal-primary hover:text-teal-accent font-bold hover:underline transition-all"
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
                  <div className="w-full border-t border-dashboard-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-dashboard-card text-slate-400 font-medium">
                    {t("signup.orContinueWith")}
                  </span>
                </div>
              </div>

              <div className="mt-4">
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
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg border border-dashboard-border bg-dashboard-card text-slate-700 text-sm font-semibold hover:bg-dashboard-bg hover:border-teal-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>
                    {googleLoading
                      ? t("signup.signingUp")
                      : "Continue with Google"}
                  </span>
                </button>
              </div>
            </div>
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
                src="/yetti/yetti_face.png"
                alt="Yetti posing"
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
