"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  dashboardAPI,
  type DashboardResponse,
  integrationsAPI,
  chatAPI,
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { formatNumberInK } from "@/lib/utils";
import {
  MessageSquare,
  Link2,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Integration states
  const [instagramIntegration, setInstagramIntegration] = useState<{
    username: string;
    profile_picture: string | null;
  } | null>(null);
  const [telegramBotInfo, setTelegramBotInfo] = useState<{
    username: string;
    first_name: string;
  } | null>(null);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messageCountLoading, setMessageCountLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        // Fallback data
        setDashboardData({
          user_profile: {
            first_name: user?.user_metadata?.first_name || "User",
            last_name: user?.user_metadata?.last_name,
          },
          workspace_summary: {
            total_workspaces: 1,
            active_workspaces: 1,
            total_agents: 0,
            active_agents: 0,
            total_integrations: 0,
            active_integrations: 0,
          },
          recent_activity: [],
          quick_stats: {
            today_interactions: 0,
            this_week_interactions: 0,
            this_month_interactions: 0,
            avg_response_time: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  // Fetch integration status
  useEffect(() => {
    let cancelled = false;

    async function checkIntegrations() {
      if (!user) {
        setInstagramIntegration(null);
        setTelegramBotInfo(null);
        return;
      }
      setIntegrationsLoading(true);
      try {
        const instagramData =
          await integrationsAPI.getInstagramIntegration();
        if (!cancelled) setInstagramIntegration(instagramData);
        const telegramData = await integrationsAPI.getTelegramBotInfo();
        if (!cancelled) setTelegramBotInfo(telegramData);
      } catch (error) {
        if (!cancelled) console.error("Error checking integrations:", error);
      } finally {
        if (!cancelled) setIntegrationsLoading(false);
      }
    }
    checkIntegrations();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Fetch message count
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setMessageCount(0);
      return;
    }
    setMessageCountLoading(true);
    chatAPI
      .getMessageCount()
      .then((count) => {
        if (!cancelled) setMessageCount(count);
      })
      .catch(() => {
        if (!cancelled) setMessageCount(0);
      })
      .finally(() => {
        if (!cancelled) setMessageCountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const getUserName = () => {
    if (dashboardData?.user_profile?.first_name) {
      return dashboardData.user_profile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-primary" />
          <p className="text-slate-600 font-medium">{t("dashboard.loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-teal-primary via-[#0d6159] to-slate-800 p-4 sm:p-6 md:p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-teal-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20 shrink-0">
              <span className="text-2xl sm:text-3xl">👋</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white break-words">
                {t("dashboard.welcomeBack")}, {getUserName()}
              </h1>
              <p className="mt-1 text-slate-300 text-sm sm:text-base md:text-lg">
                {t("dashboard.welcomeMessage")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 mt-2 sm:mt-0">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 sm:px-4 py-1.5 backdrop-blur-sm ring-1 ring-white/10 w-full sm:w-auto justify-center sm:justify-start">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-200 whitespace-nowrap">
                {t("dashboard.systemOperational")}
              </span>
            </div>

          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Messages */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-primary/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.totalMessages")}
              </p>
              {messageCountLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatNumberInK(messageCount)}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-primary/10 text-teal-primary transition-colors group-hover:bg-teal-primary group-hover:text-white shrink-0 ml-3">
              <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              <ArrowUpRight className="h-3 w-3" />
              {dashboardData?.quick_stats?.this_week_interactions ?? 0}
            </span>
            <span className="text-slate-500">{t("dashboard.newThisWeek")}</span>
          </div>
        </div>

        {/* Active Integrations */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-primary/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.integrations")}
              </p>
              {integrationsLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  {(instagramIntegration ? 1 : 0) + (telegramBotInfo ? 1 : 0)}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-primary/10 text-teal-primary transition-colors group-hover:bg-teal-primary group-hover:text-white shrink-0 ml-3">
              <Link2 className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              <Activity className="h-3 w-3" />
              {t("dashboard.active")}
            </span>
            <span className="text-slate-500">{t("dashboard.allSystemsOperational")}</span>
          </div>
        </div>

        {/* Total Agents */}
        <Link
          href="/dashboard/knowledge-base"
          className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-primary/30 block"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Total Agents
              </p>
              {loading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  {dashboardData?.workspace_summary?.total_agents ?? 0}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-primary/10 text-teal-primary transition-colors group-hover:bg-teal-primary group-hover:text-white shrink-0 ml-3">
              <Bot className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="text-slate-500">View and manage agents</span>
          </div>
        </Link>
      </div>

      {/* Platform Status Section */}
      <div className="rounded-2xl sm:rounded-3xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {t("dashboard.platformStatus")}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {t("dashboard.platformStatusDesc")}
            </p>
          </div>
          <Link
            href="/dashboard/integrations"
            className="text-xs sm:text-sm font-semibold text-teal-primary hover:text-teal-accent hover:underline whitespace-nowrap shrink-0"
          >
            {t("dashboard.manageIntegrations")} &rarr;
          </Link>
        </div>

        {integrationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        ) : !instagramIntegration && !telegramBotInfo ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-dashboard-bg border border-dashed border-dashboard-border">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mb-4 text-slate-600 font-medium">
              {t("dashboard.noIntegrations")}
            </p>
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center justify-center rounded-xl bg-teal-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-accent hover:shadow-lg hover:shadow-teal-primary/20 active:scale-95"
            >
              {t("dashboard.addIntegration")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {instagramIntegration && (
              <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-dashboard-border bg-dashboard-bg p-3 sm:p-4 transition-all hover:bg-dashboard-card hover:shadow-md hover:border-dashboard-border">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                    {instagramIntegration.profile_picture ? (
                      <Image
                        src={instagramIntegration.profile_picture}
                        alt={instagramIntegration.username}
                        width={40}
                        height={40}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/yetti/instagram_logo.png"
                        alt="Instagram"
                        width={20}
                        height={20}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm sm:text-base text-slate-700 truncate">
                      Instagram
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      @{instagramIntegration.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600 hidden sm:inline">
                    {t("dashboard.online")}
                  </span>
                </div>
              </div>
            )}
            {telegramBotInfo && (
              <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-dashboard-border bg-dashboard-bg p-3 sm:p-4 transition-all hover:bg-dashboard-card hover:shadow-md hover:border-dashboard-border">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                    <Image
                      src="/yetti/telegram_logo.png"
                      alt="Telegram"
                      width={20}
                      height={20}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm sm:text-base text-slate-700 truncate">
                      Telegram
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      @{telegramBotInfo.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600 hidden sm:inline">
                    {t("dashboard.online")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
