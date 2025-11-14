"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Globe2,
  CalendarClock,
  ChevronDown,
} from "lucide-react";
import {
  workspaceHoursAPI,
  type DayKey,
  type TimeRange,
} from "@/lib/api/workspace-hours";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

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
        className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{value}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {open && (
        <div
          className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white"
          role="listbox"
        >
          {options.map((tz) => {
            const selected = tz === value;
            return (
              <button
                key={tz}
                type="button"
                onClick={() => handleSelect(tz)}
                className={`flex w-full items-center px-3 py-2 text-left text-sm ${
                  selected
                    ? "bg-sky-100 text-sky-700"
                    : "text-gray-700 hover:bg-sky-50"
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
        if (err?.message?.includes("404")) {
          // ignore when schedule not yet set
          setSchedule(buildDefaultSchedule());
          setWorkspaceOnline(true);
          setSuccess(null);
        } else {
          setError(err.message || "Failed to load working hours");
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
    } catch (err: any) {
      setError(err.message || "Failed to save working hours");
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
      setSuccess(
        `Workspace ${response.workspace_online ? "enabled" : "paused"} successfully.`
      );
    } catch (err: any) {
      setError(err.message || "Failed to update workspace status");
      setWorkspaceOnline(previousValue);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-[#0b1220] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Working Hours</h1>
            <p className="text-white/70 text-sm">
              Set workspace availability, timezone and weekly schedules.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Workspace Availability
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Turn the workspace on or off instantly. When off, it remains
              unavailable even during scheduled hours.
            </p>
          </div>
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
            <span className="h-7 w-12 rounded-full bg-gray-200 transition-all peer-checked:bg-sky-600 peer-disabled:opacity-50"></span>
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5" />
          </label>
        </div>
        {statusSaving && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-sm text-sky-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating status…
          </div>
        )}

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-3 pb-4">
            <Globe2 className="h-5 w-5 text-sky-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Time Zone</h2>
              <p className="text-gray-600 text-sm">
                Meetings and automations will follow this timezone.
              </p>
            </div>
          </div>
          <TimezoneDropdown
            value={timezone}
            options={timezones}
            onChange={(val) => setTimezone(val)}
            disabled={loading}
          />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Weekly working hours
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set available windows for each day. Remove all windows to mark a
              day as unavailable.
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading working hours…
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
              {DAYS.map((day) => {
                const ranges = schedule[day.key] || [];
                const dayEnabled = ranges.length > 0;
                return (
                  <div key={day.key} className="px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-40">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {day.label}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {dayEnabled
                            ? `${ranges.length} window${ranges.length > 1 ? "s" : ""}`
                            : "Unavailable"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={dayEnabled}
                            onChange={(event) =>
                              handleToggleDay(day.key, event.target.checked)
                            }
                          />
                          <span className="h-6 w-11 rounded-full bg-gray-200 transition-all peer-checked:bg-sky-600"></span>
                          <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                        </label>
                      </div>
                    </div>
                    {dayEnabled && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {ranges.map((range, index) => (
                          <div
                            key={`${day.key}-${index}`}
                            className="flex items-center gap-2"
                          >
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
                              className="w-28 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-sky-500"
                            />
                            <span className="text-xs font-medium text-gray-500">
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
                              className="w-28 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-sky-500"
                            />
                            {ranges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRange(day.key, index)}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddRange(day.key)}
                          className="inline-flex items-center gap-2 rounded-md border border-dashed border-sky-300 px-2 py-2 text-xs font-medium text-sky-600"
                        >
                          <Plus className="h-4 w-4" />
                          Add window
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || statusSaving || !workspaceId}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:from-sky-700 hover:to-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
