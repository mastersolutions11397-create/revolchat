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
} from "lucide-react";
import {
  workspaceHoursAPI,
  type DayKey,
  type TimeRange,
} from "@/lib/api/workspace-hours";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { toast } from "sonner";
import { profileAPI, UserProfileUpdate } from "@/lib/api/profile";
import Link from "next/link";

const DAYS: Array<{ key: DayKey; label: string; short: string }> = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
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

  // General Settings State
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
  });

  // Yetti Hours State
  const { selectedWorkspaceId, currentWorkspace } = useWorkspace();
  const { onNavigateToSettings } = useOnboardingTour();
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

  // Trigger tour callback when landing on settings page
  useEffect(() => {
    onNavigateToSettings();
  }, [onNavigateToSettings]);

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
          const errorMessage = err.message || "Failed to load working hours";
          setHoursError(errorMessage);
          toast.error("Could not load working hours", {
            description: "Using default schedule. You can customize it below.",
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
        const data = await profileAPI.getProfile();
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          company: data.company || "",
          phone: data.phone || "",
          email: user.email || "",
        });
        if (data.notification_preferences) {
          setFormData({
            email_notifications: data.notification_preferences.email ?? true,
            sms_notifications: data.notification_preferences.sms ?? false,
            push_notifications: data.notification_preferences.push ?? true,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Use user metadata as fallback
        setProfileData({
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          company: user.user_metadata?.company || "",
          phone: user.user_metadata?.phone || "",
          email: user.email || "",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
      const updateData: UserProfileUpdate = {
        first_name: profileData.first_name || undefined,
        last_name: profileData.last_name || undefined,
        company: profileData.company || undefined,
        phone: profileData.phone || undefined,
      };

      await profileAPI.updateProfile(updateData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: UserProfileUpdate = {
        notification_preferences: {
          email: formData.email_notifications,
          sms: formData.sms_notifications,
          push: formData.push_notifications,
        },
      };
      await profileAPI.updateProfile(updateData);
      toast.success("Notification settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
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
    return user?.email?.split("@")[0] || "User";
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
      setHoursSuccess("Workspace hours updated successfully.");
      toast.success("Workspace hours updated successfully");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save working hours";
      setHoursError(errorMessage);
      toast.error("Failed to save working hours", {
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
      const successMessage = `Workspace ${response.workspace_online ? "enabled" : "paused"} successfully.`;
      setHoursSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update workspace status";
      setHoursError(errorMessage);
      setWorkspaceOnline(previousValue);
      toast.error("Failed to update workspace status", {
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
              Settings
            </h1>
            <p className="mt-1 text-slate-300 text-lg">
              Manage your workspace and account preferences
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
                    Active
                  </div>
                  {user?.created_at && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Since{" "}
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
                          Personal Information
                        </h3>
                        <p className="text-sm text-slate-500">
                          Update your profile details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          First Name
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
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Last Name
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
                          placeholder="Enter last name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          Company
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
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          Phone Number
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
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Email cannot be changed
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
                      Save Profile
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
                  Yetti Hours
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
                    Availability
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
                    Updating...
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
                    Time Zone
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
                    Weekly Schedule
                  </h3>
                </div>
              </div>

              {hoursLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin mr-2 text-sky-500" />
                  Loading schedule...
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
                                {day.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 pl-14 sm:pl-0">
                              {dayEnabled
                                ? `${ranges.length} window${ranges.length > 1 ? "s" : ""}`
                                : "Unavailable"}
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
                                        to
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
                                        title="Remove window"
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
                                  Add window
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
                onClick={handleSaveWorkspaceHours}
                disabled={
                  hoursSaving || hoursLoading || statusSaving || !workspaceId
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:from-sky-700 hover:to-sky-500 hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {hoursSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
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
                Notifications
              </h2>
            </div>

            <div className="space-y-6 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Email Notifications
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Receive weekly summaries and critical alerts via email.
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
                    SMS Notifications
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Get instant alerts on your phone for urgent issues.
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
                    Push Notifications
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Receive real-time updates in your browser.
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
              <h2 className="text-xl font-bold text-slate-900">Account</h2>
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
                  <span>Sign Out</span>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Notification Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
