"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Globe2,
  CalendarClock,
  ChevronDown,
  Clock,
  Power,
} from "lucide-react";
import {
  workspaceHoursAPI,
  type DayKey,
  type TimeRange,
} from "@/lib/api/workspace-hours";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { toast } from "sonner";

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

export default function WorkspaceHoursPage() {
  const { selectedWorkspaceId, currentWorkspace } = useWorkspace();
  const workspaceId = selectedWorkspaceId || currentWorkspace?.id || null;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<DayKey, TimeRange[]>>(
    buildDefaultSchedule()
  );
  const [timezone, setTimezone] = useState(detectDefaultTimezone());
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

  useEffect(() => {
    if (!workspaceId) return;

    let isMounted = true;
    const fetchHours = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await workspaceHoursAPI.getWorkingHours(workspaceId);
        if (!isMounted) return;
        setSchedule(normalizeSchedule(data.schedule));
        setTimezone(sanitizeTimeZone(data.timezone, timezones));
        setWorkspaceOnline(data.workspace_online);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.message?.includes("404") || err?.message?.toLowerCase().includes("not found") || err?.message?.toLowerCase().includes("schedule")) {
          // Workspace schedule not found - this is normal for new workspaces
          setSchedule(buildDefaultSchedule());
          setWorkspaceOnline(true);
          setSuccess(null);
        } else {
          const errorMessage = err.message || "Failed to load working hours";
          setError(errorMessage);
          toast.error("Could not load working hours", {
            description: "Using default schedule. You can customize it below."
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHours();

    return () => {
      isMounted = false;
    };
  }, [workspaceId, timezones]);

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [success]);

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

  const handleSave = async () => {
    if (!workspaceId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const safeTimezone = sanitizeTimeZone(timezone, timezones);
      const response = await workspaceHoursAPI.upsertWorkingHours(workspaceId, {
        timezone: safeTimezone,
        schedule,
        respect_schedule: respectSchedule,
        workspace_online: workspaceOnline,
      });
      setSchedule(normalizeSchedule(response.schedule));
      setTimezone(sanitizeTimeZone(response.timezone, timezones));
      setWorkspaceOnline(response.workspace_online);
      setSuccess("Workspace hours updated successfully.");
      toast.success("Workspace hours updated successfully");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save working hours";
      setError(errorMessage);
      toast.error("Failed to save working hours", {
        description: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWorkspaceOnlineToggle = async (checked: boolean) => {
    if (!workspaceId) return;
    const previousValue = workspaceOnline;
    setWorkspaceOnline(checked);
    setStatusSaving(true);
    setError(null);
    try {
      const response = await workspaceHoursAPI.updateWorkspaceOnlineStatus(
        workspaceId,
        checked
      );
      setWorkspaceOnline(response.workspace_online);
      setSchedule(normalizeSchedule(response.schedule));
      setTimezone(sanitizeTimeZone(response.timezone, timezones));
      const successMessage = `Workspace ${response.workspace_online ? "enabled" : "paused"} successfully.`;
      setSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update workspace status";
      setError(errorMessage);
      setWorkspaceOnline(previousValue);
      toast.error("Failed to update workspace status", {
        description: errorMessage
      });
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <CalendarClock className="h-8 w-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Working Hours</h1>
            <p className="mt-2 text-lg text-sky-100/80 max-w-2xl">
              Set your AI agent's availability, timezone, and weekly schedule.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {success}
          </div>
        )}

        {/* Workspace Availability */}
        <div className="flex items-start justify-between gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${workspaceOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
              <Power className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Workspace Availability
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-md">
                Turn the workspace on or off instantly. When off, it remains
                unavailable even during scheduled hours.
              </p>
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
                disabled={statusSaving || loading}
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
        <div className="border-t border-slate-100 pt-8">
          <div className="flex items-center gap-3 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Time Zone</h2>
              <p className="text-slate-500 text-sm">
                All schedules will follow this timezone.
              </p>
            </div>
          </div>
          <div className="max-w-md">
            <TimezoneDropdown
              value={timezone}
              options={timezones}
              onChange={(val) => setTimezone(val)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="border-t border-slate-100 pt-8">
          <div className="mb-6 flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Weekly Schedule
              </h2>
              <p className="text-sm text-slate-500">
                Set available windows for each day.
              </p>
            </div>
          </div>
          
          {loading ? (
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
                  <div key={day.key} className={`px-6 py-5 transition-colors ${dayEnabled ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-40 flex items-center gap-4 sm:block">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={dayEnabled}
                              onChange={(event) =>
                                handleToggleDay(day.key, event.target.checked)
                              }
                            />
                            <div className="h-6 w-11 rounded-full bg-slate-200 transition-all peer-checked:bg-sky-500 peer-focus:ring-4 peer-focus:ring-sky-500/20"></div>
                            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5 shadow-sm" />
                          </label>
                          <span className={`text-sm font-bold ${dayEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
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
                                    className="w-28 rounded-md border-0 bg-transparent px-2 py-1 text-sm font-medium text-slate-900 focus:ring-0"
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
                                    className="w-28 rounded-md border-0 bg-transparent px-2 py-1 text-sm font-medium text-slate-900 focus:ring-0"
                                  />
                                </div>
                                
                                {ranges.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRange(day.key, index)}
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
                              className="inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-sky-200 px-3 py-2 text-xs font-semibold text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition-all"
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
            onClick={handleSave}
            disabled={saving || loading || statusSaving || !workspaceId}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:from-sky-700 hover:to-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
