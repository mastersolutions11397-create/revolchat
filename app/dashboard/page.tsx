"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  dashboardAPI,
  type DashboardResponse,
  integrationsAPI,
  chatAPI,
  agentsAPI,
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { formatNumberInK } from "@/lib/utils";
import {
  MessageSquare,
  Link2,
  Loader2,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Bot,
} from "lucide-react";
import TrialNotificationsWidget from "@/components/dashboard/TrialNotificationsWidget";
export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const activeWorkspaceId = activeWorkspace?.id;
  const userId = user?.id;
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
  const [agentsCount, setAgentsCount] = useState<number>(0);
  const [agentsCountLoading, setAgentsCountLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboard(activeWorkspaceId);
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
  }, [user, activeWorkspaceId]);

  // Fetch integration status
  useEffect(() => {
    let cancelled = false;

    async function checkIntegrations() {
      if (!userId || !activeWorkspaceId) {
        setInstagramIntegration(null);
        setTelegramBotInfo(null);
        return;
      }
      setIntegrationsLoading(true);
      try {
        const instagramData =
          await integrationsAPI.getInstagramIntegration(activeWorkspaceId);
        if (!cancelled) setInstagramIntegration(instagramData);
        const telegramData = await integrationsAPI.getTelegramBotInfo(activeWorkspaceId);
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
  }, [userId, activeWorkspaceId]);

  // Fetch agents count
  useEffect(() => {
    let cancelled = false;
    if (!userId || !activeWorkspaceId) {
      setAgentsCount(0);
      return;
    }
    setAgentsCountLoading(true);
    agentsAPI
      .list(activeWorkspaceId)
      .then((response) => {
        if (!cancelled) setAgentsCount(response.count ?? response.agents.length);
      })
      .catch(() => {
        if (!cancelled) setAgentsCount(0);
      })
      .finally(() => {
        if (!cancelled) setAgentsCountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, activeWorkspaceId]);

  const integrationsCount =
    (instagramIntegration ? 1 : 0) + (telegramBotInfo ? 1 : 0);

  // Fetch message count
  useEffect(() => {
    let cancelled = false;
    if (!userId || !activeWorkspaceId) {
      setMessageCount(0);
      return;
    }
    setMessageCountLoading(true);
    chatAPI
      .getMessageCount(activeWorkspaceId)
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
  }, [userId, activeWorkspaceId]);

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand" />
          <p className="text-text-muted font-medium">{t("dashboard.loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("dashboard.welcomeBack")}, {getUserName()}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{t("dashboard.welcomeMessage")}</p>
        </div>
        <Link
          href="/dashboard/integrations"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-all shadow-brand cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          Add Channel
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-error-border bg-error-bg p-4 text-sm text-error-text flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Messages */}
        <Link
          href="/dashboard/inbox"
          className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand/30 block"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-wider">
                {t("dashboard.totalMessages")}
              </p>
              {messageCountLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-text-primary">
                  {formatNumberInK(messageCount)}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white shrink-0 ml-3">
              <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              <ArrowUpRight className="h-3 w-3" />
              {dashboardData?.quick_stats?.this_week_interactions ?? 0}
            </span>
            <span className="text-text-muted">{t("dashboard.newThisWeek")}</span>
          </div>
        </Link>

        {/* Active Integrations */}
        <Link
          href="/dashboard/integrations"
          className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand/30 block"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-wider">
                {t("dashboard.integrations")}
              </p>
              {integrationsLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-text-primary">
                  {integrationsCount}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white shrink-0 ml-3">
              <Link2 className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="flex items-center gap-1 font-medium text-text-muted bg-background px-2 py-0.5 rounded-full whitespace-nowrap">
              <Activity className="h-3 w-3" />
              {t("dashboard.active")}
            </span>
            <span className="text-text-muted">{t("dashboard.allSystemsOperational")}</span>
          </div>
        </Link>

        {/* Total Agents */}
        <Link
          href="/dashboard/bots"
          className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand/30 block"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-wider">
                Total Agents
              </p>
              {agentsCountLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-text-primary">
                  {agentsCount}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white shrink-0 ml-3">
              <Bot className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="text-text-muted">View and manage agents</span>
          </div>
        </Link>
      </div>

      <TrialNotificationsWidget />

      {/* Platform Status Section */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary">
              {t("dashboard.platformStatus")}
            </h3>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              {t("dashboard.platformStatusDesc")}
            </p>
          </div>
          <Link
            href="/dashboard/integrations"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-light hover:underline whitespace-nowrap shrink-0"
          >
            {t("dashboard.manageIntegrations")} &rarr;
          </Link>
        </div>

        {integrationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        ) : !instagramIntegration && !telegramBotInfo ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-background border border-dashed border-border">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-text-muted" />
            </div>
            <p className="mb-4 text-text-muted font-medium">
              {t("dashboard.noIntegrations")}
            </p>
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-light active:scale-95"
            >
              {t("dashboard.addIntegration")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {instagramIntegration && (
              <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border bg-background p-3 sm:p-4 transition-all hover:bg-surface hover:shadow-md hover:border-border">
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
                    <span className="font-semibold text-sm sm:text-base text-text-secondary truncate">
                      Instagram
                    </span>
                    <span className="text-xs text-text-muted truncate">
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
              <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border bg-background p-3 sm:p-4 transition-all hover:bg-surface hover:shadow-md hover:border-border">
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
                    <span className="font-semibold text-sm sm:text-base text-text-secondary truncate">
                      Telegram
                    </span>
                    <span className="text-xs text-text-muted truncate">
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
