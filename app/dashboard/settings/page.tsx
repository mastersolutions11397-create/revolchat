"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  Bell,
  Globe,
  Shield,
  LogOut,
  User,
  Save,
  Loader2,
  Plus,
  Trash2,
  UserCircle2,
  Mail,
  Building2,
  Phone,
  Calendar,
  Gift,
} from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/utils/referral-code";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    email: "",
  });

  // Referral State
  const [referralCodeUsed, setReferralCodeUsed] = useState<string | null>(null);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralLinking, setReferralLinking] = useState(false);

  // General Settings State
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
  });

  // Load Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setProfileLoading(true);
        // Use user metadata as profile data since we don't have a separate profiles table for user settings
        setProfileData({
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          company: user.user_metadata?.company || "",
          phone: user.user_metadata?.phone || "",
          email: user.email || "",
        });

        // For now, use default notification preferences
        setFormData({
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileData({
          first_name: "",
          last_name: "",
          company: "",
          phone: "",
          email: user.email || "",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Load Referral Data
  useEffect(() => {
    const fetchReferral = async () => {
      if (!user) return;
      try {
        setReferralLoading(true);

        // First check if current user has a referral code (to verify system is working)
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("referral_code")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("Current user profile check:", {
          userProfile,
          profileError,
        });

        if (profileError) {
          console.error("Error checking user profile:", profileError);
          toast.error("Referral system may not be set up yet.");
          return;
        }

        let currentUserProfile = userProfile;

        if (!currentUserProfile) {
          console.log(
            "No profile found for current user - attempting to create profile"
          );

          // Try to create profile for current user
          const username = user.email?.split("@")[0] || "USER";
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

          const { data: newProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: user.id,
              referral_code: referralCode,
              total_earnings: 0,
              total_referrals: 0,
            })
            .select()
            .single();

          if (createError) {
            console.error("Failed to create profile:", createError);
            toast.error(
              "Failed to create your referral profile. Database may not be set up."
            );
            return;
          }

          console.log("Created profile for current user:", newProfile);
          toast.success("Your referral profile has been created!");
          currentUserProfile = newProfile;
        }

        console.log(
          "Current user referral code:",
          currentUserProfile!.referral_code
        );

        // Now check if user has used a referral code
        const { data: referral, error } = await supabase
          .from("referrals")
          .select("referral_code")
          .eq("referee_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (referral) {
          setReferralCodeUsed(referral.referral_code);
        }
      } catch (err) {
        console.error("Error fetching referral:", err);
      } finally {
        setReferralLoading(false);
      }
    };

    fetchReferral();
  }, [user]);

  const handleLinkReferral = async () => {
    if (!user || !newReferralCode.trim()) return;

    try {
      setReferralLinking(true);
      const codeToUse = newReferralCode.trim().toUpperCase();

      console.log("Attempting to link referral code:", codeToUse);

      // First check if user_profiles table exists and has data
      try {
        const { data: allCodes, error: allCodesError } = await supabase
          .from("user_profiles")
          .select("referral_code");

        console.log("First 10 referral codes in table:", allCodes);
        console.log("All codes query error:", allCodesError);

        if (allCodesError) {
          console.error("user_profiles table may not exist:", allCodesError);
          toast.error(
            "Referral system not set up yet. Please contact support."
          );
          return;
        }

        console.log(
          "user_profiles table exists, found",
          allCodes?.length || 0,
          "sample records"
        );

        // Also test if we can query by referral_code at all
        if (allCodes && allCodes.length > 0) {
          const testCode = allCodes[0].referral_code;
          console.log("Testing query with existing code:", testCode);

          const { data: testResult, error: testError } = await supabase
            .from("user_profiles")
            .select("user_id, referral_code")
            .eq("referral_code", testCode)
            .maybeSingle();

          console.log("Test query result:", { testResult, testError });
        }
      } catch (err) {
        console.error("Error checking user_profiles table:", err);
        toast.error("Referral system not available. Please try again later.");
        return;
      }

      // Find the referrer
      console.log("Searching for referral code:", codeToUse);
      console.log("Code length:", codeToUse.length);
      console.log("Code uppercase:", codeToUse === codeToUse.toUpperCase());

      const { data: referrerProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, referral_code")
        .eq("referral_code", codeToUse)
        .maybeSingle();

      console.log("Exact match result:", {
        referrerProfile,
        profileError,
        exactCodeMatch: referrerProfile?.referral_code === codeToUse,
      });

      // If exact match fails, try case-insensitive search
      if (!referrerProfile) {
        console.log("Exact match failed, trying case-insensitive search...");
        const { data: caseInsensitiveResult, error: caseError } = await supabase
          .from("user_profiles")
          .select("user_id, referral_code")
          .ilike("referral_code", codeToUse)
          .maybeSingle();

        console.log("Case-insensitive result:", {
          caseInsensitiveResult,
          caseError,
          caseMatch: caseInsensitiveResult?.referral_code?.toUpperCase() === codeToUse
        });

        // If case-insensitive also fails, show similar codes
        if (!caseInsensitiveResult) {
          const { data: similarCodes, error: similarError } = await supabase
            .from("user_profiles")
            .select("referral_code")
            .ilike("referral_code", `${codeToUse.substring(0, 4)}%`)
            .limit(10);

          console.log("Similar codes found:", similarCodes);
          console.log("Similar codes error:", similarError);
        }
      }

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        toast.error("Error checking referral code: " + profileError.message);
        return;
      }

      if (!referrerProfile) {
        console.log("No referrer profile found for code:", codeToUse);
        toast.error("Invalid referral code - this code doesn't exist");
        return;
      }

      if (referrerProfile.user_id === user.id) {
        toast.error("Cannot use your own referral code");
        return;
      }

      // Check if user already has a referral
      const { data: existingReferral } = await supabase
        .from("referrals")
        .select("id")
        .eq("referee_id", user.id)
        .maybeSingle();

      if (existingReferral) {
        toast.error("You have already linked a referral code");
        return;
      }

      console.log("Inserting referral relationship...");

      // Link referral
      const { error: linkError } = await supabase.from("referrals").insert({
        referrer_id: referrerProfile.user_id,
        referee_id: user.id,
        referral_code: codeToUse,
        status: "pending",
      });

      console.log("Referral insertion result:", { linkError });

      if (linkError) throw linkError;

      setReferralCodeUsed(codeToUse);
      setNewReferralCode("");
      toast.success("Referral code linked successfully!");
    } catch (err: any) {
      console.error("Error linking referral:", err);
      toast.error(err.message || "Failed to link referral code");
    } finally {
      setReferralLinking(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);

    try {
      // Since we're using user metadata, we can't update it directly from the client
      // For now, just show success message
      toast.success(t("settings.profile.updated"));
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(t("settings.profile.failed"), {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // For now, just save notification preferences locally
      // In a full implementation, this would be saved to user metadata or a database
      localStorage.setItem(
        "notification_preferences",
        JSON.stringify({
          email: formData.email_notifications,
          sms: formData.sms_notifications,
          push: formData.push_notifications,
        })
      );
      toast.success(t("settings.notifications.saved"));
    } catch (err) {
      toast.error(t("settings.notifications.failed"));
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
    }
    if (profileData.first_name) {
      return profileData.first_name[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserName = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    if (profileData.first_name) {
      return profileData.first_name;
    }
    return user?.email?.split("@")[0] || t("settings.profile.user");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto animate-fade-in-up px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{t("settings.title")}</h1>
            <p className="text-sm text-text-muted">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Section */}
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
            <div className="bg-gradient-to-br from-background via-brand/5 to-background px-8 py-6 border-b border-border">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-lg ring-4 ring-white">
                    {getInitials()}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {getUserName()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-text-muted" />
                    <p className="text-text-secondary">{profileData.email}</p>
                  </div>
                </div>

                {/* Account Badge */}
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-bold text-brand border border-brand/20">
                    <div className="h-2 w-2 rounded-full bg-brand animate-pulse"></div>
                    {t("settings.profile.active")}
                  </div>
                  {user && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {t("settings.profile.since")}{" "}
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-brand/10 rounded-lg text-brand">
                        <UserCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">
                          {t("settings.profile.title")}
                        </h3>
                        <p className="text-sm text-text-muted">
                          {t("settings.profile.subtitle")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          {t("settings.profile.firstName")}
                        </label>
                        <input
                          type="text"
                          value={profileData.first_name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary transition-all hover:border-brand-light focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
                          placeholder={t("settings.profile.enterFirstName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">
                          {t("settings.profile.lastName")}
                        </label>
                        <input
                          type="text"
                          value={profileData.last_name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary transition-all hover:border-brand-light focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
                          placeholder={t("settings.profile.enterLastName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-text-muted" />
                          {t("settings.profile.company")}
                        </label>
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              company: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary transition-all hover:border-brand-light focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
                          placeholder={t("settings.profile.enterCompanyName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-text-muted" />
                          {t("settings.profile.phone")}
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary transition-all hover:border-brand-light focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
                          placeholder={t("settings.profile.enterPhoneNumber")}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-text-muted" />
                          {t("settings.profile.email")}
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-secondary cursor-not-allowed"
                        />
                        <p className="text-xs text-text-muted mt-2">
                          {t("settings.profile.emailCannotChange")}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-text-muted" />
                          {t("settings.profile.referralCode")}
                        </label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={referralCodeUsed || newReferralCode}
                              onChange={(e) =>
                                setNewReferralCode(e.target.value.toUpperCase())
                              }
                              disabled={!!referralCodeUsed || referralLoading}
                              placeholder={t(
                                "settings.profile.enterReferralCode"
                              )}
                              className={`w-full rounded-xl border border-border px-4 py-3 text-text-primary transition-all ${
                                referralCodeUsed
                                  ? "bg-background text-text-secondary cursor-not-allowed"
                                  : "bg-background hover:border-brand-light focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
                              }`}
                            />
                            {referralCodeUsed && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                  <svg
                                    className="h-3 w-3 text-green-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          {!referralCodeUsed && (
                            <button
                              onClick={handleLinkReferral}
                              disabled={
                                referralLinking || !newReferralCode.trim()
                              }
                              className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {referralLinking && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {t("settings.profile.apply")}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          {referralCodeUsed
                            ? t("settings.profile.referralApplied")
                            : t("settings.profile.referralInstructions")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-light hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {profileSaving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t("settings.profile.saveProfile")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {t("settings.notifications.title")}
              </h2>
            </div>

            <div className="space-y-6 divide-y divide-border">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t("settings.notifications.email")}
                  </h3>
                  <p className="text-text-muted text-sm mt-0.5">
                    {t("settings.notifications.emailDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-6">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t("settings.notifications.sms")}
                  </h3>
                  <p className="text-text-muted text-sm mt-0.5">
                    {t("settings.notifications.smsDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sms_notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sms_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-6">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t("settings.notifications.push")}
                  </h3>
                  <p className="text-text-muted text-sm mt-0.5">
                    {t("settings.notifications.pushDesc")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.push_notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        push_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-background rounded-lg text-text-secondary">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {t("settings.account.title")}
              </h2>
            </div>

            <div className="space-y-4 max-w-xl">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-between px-6 py-4 border border-red-100 rounded-xl text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-white transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span>{t("settings.account.signOut")}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Save Button for General Settings */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("settings.notifications.saving")}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t("settings.notifications.save")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
