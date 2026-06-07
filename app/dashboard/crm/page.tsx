"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Users,
  RefreshCw,
} from "lucide-react";

type Trial = {
  id: string;
  bot_id: string;
  platform: string;
  platform_user_id: string;
  trial_start_at: string;
  trial_end_at: string;
  status: "active" | "expired" | "subscribed" | "cancelled";
  admin_notified_at: string | null;
  created_at: string;
};

type TrialWithBot = Trial & { bot_name: string };

const STATUS_CONFIG = {
  active:     { label: "Trial active",   icon: Clock,        color: "text-brand",   bg: "bg-brand/10"   },
  expired:    { label: "Awaiting payment",icon: AlertCircle,  color: "text-warning", bg: "bg-warning/10" },
  subscribed: { label: "Subscribed",      icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  cancelled:  { label: "Cancelled",       icon: XCircle,      color: "text-error",   bg: "bg-error/10"   },
};

const PLATFORM_EMOJI: Record<string, string> = {
  telegram:  "✈️",
  instagram: "📸",
  whatsapp:  "💬",
};

function StatusBadge({ status }: { status: Trial["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

export default function CrmPage() {
  const { user } = useAuth();
  const [trials, setTrials] = useState<TrialWithBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Trial["status"] | "all">("all");

  const fetchTrials = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/crm/trials");
      if (!res.ok) return;
      const data = await res.json();
      setTrials(data.trials ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrials();
  }, [fetchTrials]);

  const counts = {
    all:        trials.length,
    active:     trials.filter((t) => t.status === "active").length,
    expired:    trials.filter((t) => t.status === "expired").length,
    subscribed: trials.filter((t) => t.status === "subscribed").length,
    cancelled:  trials.filter((t) => t.status === "cancelled").length,
  };

  const visible = filter === "all" ? trials : trials.filter((t) => t.status === filter);

  const TABS: { key: Trial["status"] | "all"; label: string }[] = [
    { key: "all",        label: `All (${counts.all})` },
    { key: "active",     label: `Active (${counts.active})` },
    { key: "expired",    label: `Awaiting payment (${counts.expired})` },
    { key: "subscribed", label: `Subscribed (${counts.subscribed})` },
    { key: "cancelled",  label: `Cancelled (${counts.cancelled})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User CRM</h1>
          <p className="text-text-muted mt-1 text-sm">
            All end-user trials and subscriptions across your bots.
          </p>
        </div>
        <button
          onClick={fetchTrials}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-background transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total users",    value: counts.all,        color: "text-text-primary" },
          { label: "Active trials",  value: counts.active,     color: "text-brand"        },
          { label: "Subscribed",     value: counts.subscribed, color: "text-success"      },
          { label: "Awaiting payment", value: counts.expired,  color: "text-warning"      },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-background rounded-xl p-1 border border-border w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === tab.key
                ? "bg-surface shadow-sm text-text-primary border border-border"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Users className="w-8 h-8 text-border" aria-hidden="true" />
            <p className="text-sm text-text-muted">
              {filter === "all"
                ? "No users yet. Trials appear here when someone messages a monetized bot."
                : `No ${filter} users.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Platform user</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Bot</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Trial started</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Trial ends</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((t) => (
                  <tr key={t.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="text-base" aria-hidden="true">
                          {PLATFORM_EMOJI[t.platform] ?? "💬"}
                        </span>
                        <span className="font-mono text-xs text-text-secondary">
                          {t.platform_user_id}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {t.bot_name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(t.trial_start_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(t.trial_end_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
