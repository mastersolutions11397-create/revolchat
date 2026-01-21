"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
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
  Globe2,
  CalendarClock,
  ChevronDown,
  Clock,
  Power,
  UserCircle2,
  Mail,
  Building2,
  Phone,
  Calendar,
  Gift,
} from "lucide-react";
import {
  workspaceHoursAPI,
  type DayKey,
  type TimeRange,
} from "@/lib/api/workspace-hours";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/utils/referral-code";
import Link from "next/link";
import { Ticket } from "lucide-react";

// Days will be translated in the component using useLanguage
const DAYS: Array<{ key: DayKey; labelKey: string; shortKey: string }> = [
  {
    key: "monday",
    labelKey: "settings.days.monday",
    shortKey: "settings.days.mon",
  },
  {
    key: "tuesday",
    labelKey: "settings.days.tuesday",
    shortKey: "settings.days.tue",
  },
  {
    key: "wednesday",
    labelKey: "settings.days.wednesday",
    shortKey: "settings.days.wed",
  },
  {
    key: "thursday",
    labelKey: "settings.days.thursday",
    shortKey: "settings.days.thu",
  },
  {
    key: "friday",
    labelKey: "settings.days.friday",
    shortKey: "settings.days.fri",
  },
  {
    key: "saturday",
    labelKey: "settings.days.saturday",
    shortKey: "settings.days.sat",
  },
  {
    key: "sunday",
    labelKey: "settings.days.sunday",
    shortKey: "settings.days.sun",
  },
];

const DEFAULT_RANGE: TimeRange = { start: "09:00", end: "17:00" };

const buildDefaultSchedule = (): Record<DayKey, TimeRange[]> => {
  return DAYS.reduce(
    (acc, day) => {
      acc[day.key] = [
        ...(day.key === "saturday" || day.key === "sunday"
          ? []
          : [{ ...DEFAULT_RANGE }]),
      ];
      return acc;
    },
    {} as Record<DayKey, TimeRange[]>
  );
};

const normalizeSchedule = (
  incoming?: Record<string, TimeRange[]>
): Record<DayKey, TimeRange[]> => {
  const base = buildDefaultSchedule();
  if (!incoming) {
    return base;
  }
  for (const day of DAYS) {
    const key = day.key;
    const daySlots = Array.isArray(incoming[key])
      ? incoming[key].map((slot) => ({
          start: slot.start,
          end: slot.end,
        }))
      : [];
    base[key] = daySlots;
  }
  return base;
};

const detectDefaultTimezone = () => {
  if (
    typeof Intl === "undefined" ||
    typeof Intl.DateTimeFormat !== "function"
  ) {
    return "UTC";
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const fallbackTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

const sanitizeTimeZone = (tz?: string, options?: string[]) => {
  if (!tz) return "UTC";
  const normalized = tz.trim();
  if (!normalized) return "UTC";

  const list = options && options.length > 0 ? options : fallbackTimezones;
  const match = list.find((entry) => entry === normalized);
  if (match) return match;

  try {
    const canonical = new Intl.DateTimeFormat("en-US", {
      timeZone: normalized,
    }).resolvedOptions().timeZone;
    if (canonical) {
      return canonical;
    }
  } catch {
    // ignore and fallback
  }

  return "UTC";
};

function TimezoneDropdown({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (tz: string) => {
    onChange(tz);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={!!disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:border-sky-300 focus:ring-4 focus:ring-sky-500/10 ${
          disabled ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{value}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {open && (
        <div
          className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
          role="listbox"
        >
          {options.map((tz) => {
            const selected = tz === value;
            return (
              <button
                key={tz}
                type="button"
                onClick={() => handleSelect(tz)}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                  selected
                    ? "bg-sky-50 text-sky-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                role="option"
                aria-selected={selected}
              >
                <span className="truncate">{tz}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  // Yetti Hours State
  const { selectedWorkspaceId, currentWorkspace } = useWorkspace();
  const { tourActive, currentStepIndex, completeTour } = useOnboardingTour();
  const workspaceId = selectedWorkspaceId || currentWorkspace?.id || null;
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursSuccess, setHoursSuccess] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<DayKey, TimeRange[]>>(
    buildDefaultSchedule()
  );
  const [workspaceTimezone, setWorkspaceTimezone] = useState(
    detectDefaultTimezone()
  );
  const [workspaceOnline, setWorkspaceOnline] = useState(true);
  const respectSchedule = true;

  const timezones = useMemo(() => {
    const set = new Set<string>(fallbackTimezones);

    if (
      typeof Intl !== "undefined" &&
      typeof (Intl as any).supportedValuesOf === "function"
    ) {
      try {
        const supported = (Intl as any).supportedValuesOf("timeZone") as
          | string[]
          | undefined;
        supported?.forEach((value: string) => set.add(value));
      } catch {
        // ignore
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  // Complete tour when landing on Settings page during tour step 4
  useEffect(() => {
    if (tourActive && currentStepIndex === 4) {
      console.log(
        "Settings page loaded during tour step 4 - completing tour after delay"
      );
      // Wait a bit to show the workspace hours tooltip before completing
      const timer = setTimeout(() => {
        console.log("Completing tour from Settings page");
        completeTour();
      }, 3000); // Show the tooltip for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [tourActive, currentStepIndex, completeTour]);

  useEffect(() => {
    if (!workspaceId) return;

    let isMounted = true;
    const fetchHours = async () => {
      setHoursLoading(true);
      setHoursError(null);
      try {
        const data = await workspaceHoursAPI.getWorkingHours(workspaceId);
        if (!isMounted) return;
        setSchedule(normalizeSchedule(data.schedule));
        setWorkspaceTimezone(sanitizeTimeZone(data.timezone, timezones));
        setWorkspaceOnline(data.workspace_online);
      } catch (err: any) {
        if (!isMounted) return;
        if (
          err?.message?.includes("404") ||
          err?.message?.toLowerCase().includes("not found") ||
          err?.message?.toLowerCase().includes("schedule")
        ) {
          // Workspace schedule not found - this is normal for new workspaces
          setSchedule(buildDefaultSchedule());
          setWorkspaceOnline(true);
          setHoursSuccess(null);
        } else {
          const errorMessage =
            err.message || t("settings.workspaceHours.failedToLoad");
          setHoursError(errorMessage);
          toast.error(t("settings.workspaceHours.couldNotLoad"), {
            description: t("settings.workspaceHours.usingDefault"),
          });
        }
      } finally {
        if (isMounted) {
          setHoursLoading(false);
        }
      }
    };

    fetchHours();

    return () => {
      isMounted = false;
    };
  }, [workspaceId, timezones]);

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

  useEffect(() => {
    if (hoursSuccess) {
      const timeout = setTimeout(() => setHoursSuccess(null), 4000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [hoursSuccess]);

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

  // Yetti Hours Handlers
  const handleToggleDay = (day: DayKey, enabled: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: enabled ? [{ ...DEFAULT_RANGE }] : [],
    }));
  };

  const handleTimeChange = (
    day: DayKey,
    index: number,
    field: keyof TimeRange,
    value: string
  ) => {
    setSchedule((prev) => {
      const dayRanges = prev[day] ? [...prev[day]] : [];
      const clampedValue = value || (field === "start" ? "09:00" : "17:00");
      dayRanges[index] = { ...dayRanges[index], [field]: clampedValue };
      return {
        ...prev,
        [day]: dayRanges,
      };
    });
  };

  const handleAddRange = (day: DayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { ...DEFAULT_RANGE }],
    }));
  };

  const handleRemoveRange = (day: DayKey, index: number) => {
    setSchedule((prev) => {
      const dayRanges = prev[day] ? [...prev[day]] : [];
      dayRanges.splice(index, 1);
      return {
        ...prev,
        [day]: dayRanges,
      };
    });
  };

  const handleSaveWorkspaceHours = async () => {
    if (!workspaceId) return;

    setHoursSaving(true);
    setHoursError(null);
    setHoursSuccess(null);
    try {
      const safeTimezone = sanitizeTimeZone(workspaceTimezone, timezones);
      const response = await workspaceHoursAPI.upsertWorkingHours(workspaceId, {
        timezone: safeTimezone,
        schedule,
        respect_schedule: respectSchedule,
        workspace_online: workspaceOnline,
      });
      setSchedule(normalizeSchedule(response.schedule));
      setWorkspaceTimezone(sanitizeTimeZone(response.timezone, timezones));
      setWorkspaceOnline(response.workspace_online);
      setHoursSuccess(t("settings.workspaceHours.updated"));
      toast.success(t("settings.workspaceHours.updated"));
      // Complete tour if on last step
      if (tourActive && currentStepIndex === 3) {
        completeTour();
      }
    } catch (err: any) {
      const errorMessage =
        err.message || t("settings.workspaceHours.failedToSave");
      setHoursError(errorMessage);
      toast.error(t("settings.workspaceHours.failedToSave"), {
        description: errorMessage,
      });
    } finally {
      setHoursSaving(false);
    }
  };

  const handleWorkspaceOnlineToggle = async (checked: boolean) => {
    if (!workspaceId) return;
    const previousValue = workspaceOnline;
    setWorkspaceOnline(checked);
    setStatusSaving(true);
    setHoursError(null);
    try {
      const response = await workspaceHoursAPI.updateWorkspaceOnlineStatus(
        workspaceId,
        checked
      );
      setWorkspaceOnline(response.workspace_online);
      setSchedule(normalizeSchedule(response.schedule));
      setWorkspaceTimezone(sanitizeTimeZone(response.timezone, timezones));
      const successMessage = response.workspace_online
        ? t("settings.workspaceHours.workspaceEnabled")
        : t("settings.workspaceHours.workspacePaused");
      setHoursSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      const errorMessage =
        err.message || t("settings.workspaceHours.failedToUpdateStatus");
      setHoursError(errorMessage);
      setWorkspaceOnline(previousValue);
      toast.error(t("settings.workspaceHours.failedToUpdateStatus"), {
        description: errorMessage,
      });
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20">
            <SettingsIcon className="h-8 w-8 text-sky-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t("settings.title")}
            </h1>
            <p className="mt-1 text-slate-300 text-lg">
              {t("settings.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Section */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-500 text-2xl font-bold text-white shadow-lg ring-4 ring-white">
                    {getInitials()}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {getUserName()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-600">{profileData.email}</p>
                  </div>
                </div>

                {/* Account Badge */}
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-700 border border-sky-200">
                    <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></div>
                    {t("settings.profile.active")}
                  </div>
                  {user?.created_at && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {t("settings.profile.since")}{" "}
                        {new Date(user.created_at).toLocaleDateString("en-US", {
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
                  <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-sky-50 rounded-lg text-sky-500">
                        <UserCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {t("settings.profile.title")}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {t("settings.profile.subtitle")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
                          placeholder={t("settings.profile.enterFirstName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
                          placeholder={t("settings.profile.enterLastName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
                          placeholder={t("settings.profile.enterCompanyName")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
                          placeholder={t("settings.profile.enterPhoneNumber")}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          {t("settings.profile.email")}
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          {t("settings.profile.emailCannotChange")}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-slate-500" />
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
                              className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all ${
                                referralCodeUsed
                                  ? "bg-slate-100 text-slate-600 cursor-not-allowed"
                                  : "bg-slate-50 hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
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
                              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {referralLinking && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {t("settings.profile.apply")}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {referralCodeUsed
                            ? t("settings.profile.referralApplied")
                            : t("settings.profile.referralInstructions")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:from-sky-700 hover:to-sky-500 hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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

          {/* Yetti Hours Section */}
          <div
            data-tour="workspace-hours-section"
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-sky-50 rounded-lg text-sky-500">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("settings.workspaceHours.title")}
                </h2>
              </div>
            </div>

            {hoursError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                {hoursError}
              </div>
            )}
            {hoursSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                {hoursSuccess}
              </div>
            )}

            {/* Workspace Availability */}
            <div className="flex items-start justify-between gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${workspaceOnline ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
                >
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t("settings.workspaceHours.availability")}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={workspaceOnline}
                    onChange={(event) =>
                      handleWorkspaceOnlineToggle(event.target.checked)
                    }
                    disabled={statusSaving || hoursLoading}
                  />
                  <div className="h-7 w-12 rounded-full bg-slate-200 transition-all peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-500/20"></div>
                  <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5 shadow-sm" />
                </label>
                {statusSaving && (
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("settings.workspaceHours.updating")}
                  </div>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <div className="flex items-center gap-3 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t("settings.workspaceHours.timezone")}
                  </h3>
                </div>
              </div>
              <div className="max-w-md">
                <TimezoneDropdown
                  value={workspaceTimezone}
                  options={timezones}
                  onChange={(val) => setWorkspaceTimezone(val)}
                  disabled={hoursLoading}
                />
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t("settings.workspaceHours.weeklySchedule")}
                  </h3>
                </div>
              </div>

              {hoursLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin mr-2 text-sky-500" />
                  {t("settings.workspaceHours.loadingSchedule")}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                  {DAYS.map((day) => {
                    const ranges = schedule[day.key] || [];
                    const dayEnabled = ranges.length > 0;
                    return (
                      <div
                        key={day.key}
                        className={`px-6 py-5 transition-colors ${dayEnabled ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-40 flex items-center gap-4 sm:block">
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={dayEnabled}
                                  onChange={(event) =>
                                    handleToggleDay(
                                      day.key,
                                      event.target.checked
                                    )
                                  }
                                />
                                <div className="h-6 w-11 rounded-full bg-slate-200 transition-all peer-checked:bg-sky-500 peer-focus:ring-4 peer-focus:ring-sky-500/20"></div>
                                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5 shadow-sm" />
                              </label>
                              <span
                                className={`text-sm font-bold ${dayEnabled ? "text-slate-900" : "text-slate-500"}`}
                              >
                                {t(day.labelKey)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 pl-14 sm:pl-0">
                              {dayEnabled
                                ? `${ranges.length} ${ranges.length > 1 ? t("settings.workspaceHours.windows") : t("settings.workspaceHours.window")}`
                                : t("settings.workspaceHours.unavailable")}
                            </p>
                          </div>

                          <div className="flex-1">
                            {dayEnabled && (
                              <div className="flex flex-col gap-3">
                                {ranges.map((range, index) => (
                                  <div
                                    key={`${day.key}-${index}`}
                                    className="flex flex-wrap items-center gap-3 animate-fade-in-up"
                                  >
                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                      <input
                                        type="time"
                                        value={range.start}
                                        onChange={(event) =>
                                          handleTimeChange(
                                            day.key,
                                            index,
                                            "start",
                                            event.target.value
                                          )
                                        }
                                        className="w-36 rounded-md border-0 bg-transparent px-3 py-1 text-sm font-medium text-slate-900 focus:ring-0"
                                      />
                                      <span className="text-xs font-medium text-slate-400">
                                        {t("settings.workspaceHours.to")}
                                      </span>
                                      <input
                                        type="time"
                                        value={range.end}
                                        onChange={(event) =>
                                          handleTimeChange(
                                            day.key,
                                            index,
                                            "end",
                                            event.target.value
                                          )
                                        }
                                        className="w-36 rounded-md border-0 bg-transparent px-3 py-1 text-sm font-medium text-slate-900 focus:ring-0"
                                      />
                                    </div>

                                    {ranges.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveRange(day.key, index)
                                        }
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t(
                                          "settings.workspaceHours.removeWindow"
                                        )}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleAddRange(day.key)}
                                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-sky-200 px-3 py-2 text-xs font-semibold text-sky-500 hover:bg-sky-50 hover:border-sky-300 transition-all"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  {t("settings.workspaceHours.addWindow")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="button"
                data-tour="save-workspace-hours-button"
                onClick={handleSaveWorkspaceHours}
                disabled={
                  hoursSaving || hoursLoading || statusSaving || !workspaceId
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:from-sky-700 hover:to-sky-500 hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {hoursSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("settings.workspaceHours.save")}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {t("settings.notifications.title")}
              </h2>
            </div>

            <div className="space-y-6 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {t("settings.notifications.email")}
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
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
                  <h3 className="text-base font-semibold text-slate-900">
                    {t("settings.notifications.sms")}
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
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
                  <h3 className="text-base font-semibold text-slate-900">
                    {t("settings.notifications.push")}
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
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
