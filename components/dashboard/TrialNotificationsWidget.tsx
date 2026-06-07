"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, AlertCircle, X } from "lucide-react";

type TrialNotification = {
  id: string;
  trial_id: string;
  bot_id: string;
  bot_name: string;
  platform: string;
  platform_user_id: string;
  notification_type: "trial_expired" | "subscribed";
  read_at: string | null;
  created_at: string;
};

export default function TrialNotificationsWidget() {
  const [notifications, setNotifications] = useState<TrialNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/trial-notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // silently fail — non-critical widget
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    await fetch("/api/trial-notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }, []);

  const unread = notifications.filter((n) => !n.read_at);

  if (loading || notifications.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">
            User Notifications
          </span>
          {unread.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-xs font-bold">
              {unread.length}
            </span>
          )}
        </div>
      </div>

      <ul className="divide-y divide-border max-h-64 overflow-y-auto">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors ${
              n.read_at ? "opacity-60" : "bg-surface"
            }`}
          >
            {n.notification_type === "subscribed" ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary">
                {n.notification_type === "subscribed" ? (
                  <>
                    <span className="font-semibold">{n.platform}</span> user subscribed
                    on <span className="font-semibold">{n.bot_name}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{n.platform}</span> user trial expired
                    on <span className="font-semibold">{n.bot_name}</span> — payment link sent
                  </>
                )}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.read_at && (
              <button
                onClick={() => markRead(n.id)}
                className="text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
                aria-label="Mark as read"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
