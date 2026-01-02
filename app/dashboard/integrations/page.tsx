"use client";

import Image from "next/image";
import { Sparkles, Loader2 } from "lucide-react";
import { Link2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { integrationsAPI } from "@/lib/api";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useAuth } from "@/lib/auth-context";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

type InstagramIntegration = {
  username: string;
  profile_picture: string | null;
};

// CHANNELS - names will be translated in the component
const CHANNELS = [
  {
    nameKey: "integrations.instagram",
    name: "Instagram", // fallback
    descriptionKey: "integrations.realTimeSupport",
    icon: "/yetti/instagram_logo.png",
    fallbackIcon: "💬",
    status: "available",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: false,
  },
  {
    nameKey: "integrations.telegram",
    name: "Telegram", // fallback
    descriptionKey: "integrations.telegramBotSupport",
    icon: "/yetti/telegram_logo.png",
    fallbackIcon: "✈️",
    status: "available",
    gradient: "from-[#ebf1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: false,
  },
  {
    nameKey: "integrations.messenger",
    name: "Messenger", // fallback
    descriptionKey: "integrations.messengerSupport",
    icon: "/yetti/messenger_logo.png",
    fallbackIcon: "📞",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: true,
  },

  {
    nameKey: "integrations.whatsapp",
    name: "WhatsApp", // fallback
    icon: "/yetti/whatsapp_logo.png",
    fallbackIcon: "📱",
    status: "coming-soon",
    gradient: "from-[#ecfff1] via-white to-white",
    iconOpacity: "opacity-50",
    comingSoon: true,
  },
];

// Skeleton Loader Component
function IntegrationSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-lg animate-pulse">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 mb-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 w-full sm:w-auto">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-200 flex-shrink-0"></div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-5 sm:h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="h-10 sm:h-12 w-full sm:w-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-16 sm:h-20 bg-slate-100 rounded-2xl"></div>
      </div>
    </div>
  );
}

// Parent Loader Overlay
function ParentLoader({ isLoading }: { isLoading: boolean }) {
  const { t } = useLanguage();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[200px]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-sky-200"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {t("integrations.loadingWorkspace")}
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { t } = useLanguage();
  const {
    selectedWorkspaceId,
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspace();
  const { user } = useAuth();
  const { onNavigateToIntegrations } = useOnboardingTour();
  const workspaceId = useMemo(
    () => selectedWorkspaceId || currentWorkspace?.id || null,
    [selectedWorkspaceId, currentWorkspace?.id]
  );

  // Trigger tour callback when landing on integrations page
  useEffect(() => {
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      onNavigateToIntegrations();
    }, 500);
    return () => clearTimeout(timer);
  }, [onNavigateToIntegrations]);

  const [instagramIntegration, setInstagramIntegration] =
    useState<InstagramIntegration | null>(null);
  const [instagramStatusMessage, setInstagramStatusMessage] = useState<
    string | null
  >(null);
  const [instagramStatusKind, setInstagramStatusKind] = useState<
    "error" | "success" | null
  >(null);
  const [instagramChecking, setInstagramChecking] = useState(false);
  const [instagramDisconnecting, setInstagramDisconnecting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Telegram connection state
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramConnecting, setTelegramConnecting] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramSuccess, setTelegramSuccess] = useState(false);
  const [telegramBotInfo, setTelegramBotInfo] = useState<{
    username: string;
    first_name: string;
  } | null>(null);
  const [telegramChecking, setTelegramChecking] = useState(false);

  // Track fetched workspace to avoid unnecessary refetches
  const fetchedWorkspaceId = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Fetch integrations data - only once per workspace
  const fetchIntegrations = useCallback(
    async (workspaceId: string, force = false) => {
      // Don't refetch if we already have data for this workspace unless forced
      if (
        !force &&
        fetchedWorkspaceId.current === workspaceId &&
        !isInitialMount.current
      ) {
        return;
      }

      fetchedWorkspaceId.current = workspaceId;
      isInitialMount.current = false;

      setInitialLoading(true);
      setInstagramChecking(true);
      setTelegramChecking(true);

      try {
        // Fetch both in parallel
        const [instagramData, telegramData] = await Promise.allSettled([
          integrationsAPI.getInstagramIntegration(workspaceId),
          integrationsAPI.getTelegramBotInfo(workspaceId),
        ]);

        // Handle Instagram result
        if (instagramData.status === "fulfilled" && instagramData.value) {
          setInstagramIntegration(instagramData.value);
          setInstagramStatusMessage(null);
          setInstagramStatusKind(null);
        } else {
          setInstagramIntegration(null);
          if (instagramData.status === "rejected") {
            setInstagramStatusMessage(
              instagramData.reason instanceof Error
                ? instagramData.reason.message
                : "Unable to verify Instagram connection."
            );
            setInstagramStatusKind("error");
          }
        }

        // Handle Telegram result
        if (
          telegramData.status === "fulfilled" &&
          telegramData.value?.username
        ) {
          setTelegramBotInfo({
            username: telegramData.value.username,
            first_name: telegramData.value.first_name || "",
          });
        } else {
          setTelegramBotInfo(null);
        }
      } catch (error) {
        console.error("Error fetching integrations:", error);
      } finally {
        setInstagramChecking(false);
        setTelegramChecking(false);
        setInitialLoading(false);
      }
    },
    []
  );

  // Initial fetch when workspace changes
  useEffect(() => {
    if (!workspaceId || workspaceLoading) {
      // Reset state when no workspace or workspace is loading
      if (!workspaceId) {
        setInstagramIntegration(null);
        setTelegramBotInfo(null);
        fetchedWorkspaceId.current = null;
      }
      return;
    }

    // Only fetch if workspace changed or on initial mount
    if (fetchedWorkspaceId.current !== workspaceId) {
      fetchIntegrations(workspaceId);
    }
  }, [workspaceId, workspaceLoading, fetchIntegrations]);

  // Refetch when window regains focus (e.g., after OAuth redirect)
  useEffect(() => {
    const handleFocus = () => {
      if (
        workspaceId &&
        !workspaceLoading &&
        fetchedWorkspaceId.current === workspaceId
      ) {
        // Refetch to get latest data after potential OAuth completion
        fetchIntegrations(workspaceId, true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [workspaceId, workspaceLoading, fetchIntegrations]);

  const handleInstagramConnect = useCallback(() => {
    if (!workspaceId) {
      window.alert(t("integrations.selectWorkspaceFirst"));
      return;
    }

    if (instagramIntegration) {
      window.alert(
        `${t("integrations.alreadyConnectedAlert")} "${instagramIntegration.username}" ${t("integrations.alreadyConnected")}`
      );
      return;
    }

    const targetUrl = new URL(
      "/api/integrations/instagram",
      window.location.origin
    );
    targetUrl.searchParams.set("workspace_id", workspaceId);

    window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
  }, [workspaceId, instagramIntegration]);

  const handleInstagramDisconnect = useCallback(async () => {
    if (!workspaceId || !instagramIntegration) return;

    const confirmed = window.confirm(
      `${t("integrations.disconnectConfirm")} "${instagramIntegration.username}"?`
    );
    if (!confirmed) return;

    setInstagramDisconnecting(true);
    setInstagramStatusMessage(null);
    setInstagramStatusKind(null);

    try {
      await integrationsAPI.disconnectInstagramIntegration(workspaceId);
      setInstagramIntegration(null);
      setInstagramStatusMessage(t("integrations.instagramDisconnected"));
      setInstagramStatusKind("success");
      // Reset fetched workspace to allow refetch if needed
      fetchedWorkspaceId.current = null;
    } catch (error: unknown) {
      setInstagramStatusMessage(
        error instanceof Error
          ? error.message
          : t("integrations.failedToDisconnectInstagram")
      );
      setInstagramStatusKind("error");
    } finally {
      setInstagramDisconnecting(false);
    }
  }, [workspaceId, instagramIntegration]);

  const handleTelegramConnect = useCallback(() => {
    if (!workspaceId) {
      window.alert(
        t("integrations.selectWorkspaceFirst").replace("Instagram", "Telegram")
      );
      return;
    }

    if (!user?.id) {
      window.alert(t("integrations.loginRequired"));
      return;
    }

    setShowTelegramModal(true);
    setTelegramBotToken("");
    setTelegramError(null);
    setTelegramSuccess(false);
  }, [workspaceId, user?.id]);

  const handleTelegramSubmit = useCallback(async () => {
    if (!workspaceId || !user?.id) {
      setTelegramError(t("integrations.workspaceOrUserMissing"));
      return;
    }

    if (!telegramBotToken.trim()) {
      setTelegramError(t("integrations.telegram.tokenRequired"));
      return;
    }

    setTelegramConnecting(true);
    setTelegramError(null);
    setTelegramSuccess(false);

    try {
      await integrationsAPI.createTelegramIntegration({
        user_id: user.id,
        telegram_bot_token: telegramBotToken.trim(),
        workspace_id: workspaceId,
      });

      setTelegramSuccess(true);
      setTelegramBotToken("");

      // Force refetch to get latest data
      if (workspaceId) {
        await fetchIntegrations(workspaceId, true);
      }

      // Close modal after a short delay
      setTimeout(() => {
        setShowTelegramModal(false);
        setTelegramSuccess(false);
      }, 2000);
    } catch (error: unknown) {
      setTelegramError(
        error instanceof Error
          ? error.message
          : t("integrations.telegram.connectError")
      );
    } finally {
      setTelegramConnecting(false);
    }
  }, [workspaceId, user?.id, telegramBotToken, fetchIntegrations]);

  const handleCloseTelegramModal = useCallback(() => {
    setShowTelegramModal(false);
    setTelegramBotToken("");
    setTelegramError(null);
    setTelegramSuccess(false);
  }, []);

  const isPageLoading = workspaceLoading || initialLoading;
  const isPageDisabled = workspaceLoading;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
      <ParentLoader isLoading={workspaceLoading} />

      {/* Header */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6 sm:p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 transition-opacity ${isPageDisabled ? "opacity-60" : ""}`}
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20 flex-shrink-0">
            <Link2 className="h-7 w-7 sm:h-8 sm:w-8 text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t("integrations.title")}
            </h1>
            <p className="mt-1 text-slate-300 text-base sm:text-lg">
              {t("integrations.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      {isPageLoading ? (
        <div className="grid gap-4 sm:gap-6 animate-in fade-in duration-300">
          {CHANNELS.map((_, index) => (
            <IntegrationSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div
          data-tour="integrations-page"
          className={`grid gap-4 sm:gap-6 transition-all duration-300 ${isPageDisabled ? "opacity-60 pointer-events-none" : "animate-in fade-in duration-300"}`}
        >
          {CHANNELS.map((channel, index) => (
            <div
              key={channel.name}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-sky-300 transition-all duration-300 shadow-lg hover:shadow-2xl"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/30 opacity-60"></div>

              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-100/0 via-sky-100/60 to-sky-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-4 sm:p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 mb-6">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 w-full sm:w-auto">
                    {/* Icon with glow effect */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-sky-50 shadow-md ring-1 ring-slate-200/50 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                        <Image
                          src={channel.icon}
                          alt={
                            channel.nameKey ? t(channel.nameKey) : channel.name
                          }
                          width={48}
                          height={48}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        <span className="hidden text-2xl sm:text-3xl">
                          {channel.fallbackIcon}
                        </span>
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {channel.nameKey ? t(channel.nameKey) : channel.name}
                        </h3>
                        {channel.nameKey === "integrations.instagram" &&
                          instagramIntegration && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {t("integrations.active")}
                            </span>
                          )}
                        {channel.nameKey === "integrations.telegram" &&
                          telegramBotInfo && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {t("integrations.active")}
                            </span>
                          )}
                        {channel.comingSoon && (
                          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-200/50">
                            {t("integrations.comingSoon")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {channel.descriptionKey
                          ? (() => {
                              const platformName = channel.nameKey
                                ? t(channel.nameKey)
                                : channel.name;
                              return t(channel.descriptionKey).replace(
                                "{platform}",
                                platformName
                              );
                            })()
                          : t("integrations.connectToEnable")}
                      </p>
                    </div>
                  </div>

                  {/* Right: Connect Button */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      className={`w-full sm:w-auto rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold transition-all duration-300 shadow-md ${
                        channel.comingSoon || isPageDisabled
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                          : channel.nameKey === "integrations.instagram" &&
                              instagramIntegration
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                            : "bg-gradient-to-r from-sky-500 to-sky-500 text-white shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105"
                      }`}
                      disabled={
                        channel.comingSoon ||
                        isPageDisabled ||
                        (channel.nameKey === "integrations.instagram" &&
                          (instagramChecking || instagramDisconnecting)) ||
                        (channel.nameKey === "integrations.telegram" &&
                          (telegramConnecting || telegramChecking))
                      }
                      onClick={() => {
                        if (channel.comingSoon || isPageDisabled) return;
                        if (channel.name === "Instagram") {
                          handleInstagramConnect();
                        }
                        if (channel.name === "Telegram") {
                          handleTelegramConnect();
                        }
                      }}
                    >
                      {channel.comingSoon ? (
                        t("integrations.comingSoon")
                      ) : channel.name === "Instagram" &&
                        instagramIntegration ? (
                        `✓ ${t("integrations.connected")}`
                      ) : channel.name === "Telegram" && telegramBotInfo ? (
                        `✓ ${t("integrations.connected")}`
                      ) : channel.name === "Telegram" && telegramConnecting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("integrations.connecting")}
                        </span>
                      ) : channel.name === "Telegram" && telegramChecking ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("integrations.checking")}
                        </span>
                      ) : channel.name === "Instagram" &&
                        (instagramChecking || instagramDisconnecting) ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {instagramDisconnecting
                            ? t("integrations.disconnecting")
                            : t("integrations.checking")}
                        </span>
                      ) : (
                        t("integrations.connect")
                      )}
                    </button>
                  </div>
                </div>

                {/* Telegram Connection Details */}
                {channel.nameKey === "integrations.telegram" && (
                  <div className="space-y-3">
                    {telegramChecking && (
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 animate-pulse">
                        <div className="relative flex-shrink-0">
                          <div className="h-5 w-5 rounded-full border-2 border-sky-200"></div>
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium">
                          {t("integrations.telegram.checkingStatus")}
                        </p>
                      </div>
                    )}

                    {!telegramChecking &&
                      telegramBotInfo &&
                      telegramBotInfo.username && (
                        <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 shadow-inner">
                          {/* Decorative gradient */}
                          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-sky-200/40 to-transparent rounded-full blur-2xl"></div>

                          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Bot Info Section */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              {/* Bot Icon with Ring */}
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full blur-sm opacity-75"></div>
                                <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full bg-white ring-4 ring-white shadow-lg flex items-center justify-center">
                                  <div className="text-xl sm:text-2xl">🤖</div>
                                </div>
                              </div>

                              {/* Bot Username and Status */}
                              <div>
                                <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-0.5">
                                  {t("integrations.connectedBot")}
                                </p>
                                <p className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                  @{telegramBotInfo.username}
                                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
                                </p>
                                {telegramBotInfo.first_name && (
                                  <p className="text-xs sm:text-sm text-slate-600">
                                    {telegramBotInfo.first_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {!telegramChecking && !telegramBotInfo && (
                      <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          {t("integrations.telegram.connectBot")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Instagram Connection Details */}
                {channel.nameKey === "integrations.instagram" && (
                  <div className="space-y-3">
                    {instagramChecking && (
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 animate-pulse">
                        <div className="relative flex-shrink-0">
                          <div className="h-5 w-5 rounded-full border-2 border-pink-200"></div>
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium">
                          {t("integrations.checkingInstagramStatus")}
                        </p>
                      </div>
                    )}

                    {!instagramChecking && instagramStatusMessage && (
                      <div
                        className={`p-3 sm:p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200 ${
                          instagramStatusKind === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {instagramStatusKind === "success" ? "✓" : "⚠️"}
                          </div>
                          <p className="text-xs sm:text-sm font-medium">
                            {instagramStatusMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    {!instagramChecking && instagramIntegration && (
                      <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 shadow-inner">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-sky-200/40 to-transparent rounded-full blur-2xl"></div>

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Profile Section */}
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            {/* Profile Picture with Ring */}
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-400 rounded-full blur-sm opacity-75"></div>
                              <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full bg-white ring-4 ring-white shadow-lg">
                                {instagramIntegration.profile_picture ? (
                                  <Image
                                    src={instagramIntegration.profile_picture}
                                    alt={instagramIntegration.username}
                                    fill
                                    sizes="(max-width: 640px) 48px, 56px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-lg sm:text-xl font-bold bg-gradient-to-br from-sky-500 to-blue-500 text-white">
                                    {instagramIntegration.username
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Username and Status */}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-0.5">
                                {t("integrations.connectedAccount")}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 truncate">
                                <span className="truncate">
                                  @{instagramIntegration.username}
                                </span>
                                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500 flex-shrink-0" />
                              </p>
                            </div>
                          </div>

                          {/* Disconnect Button */}
                          <button
                            type="button"
                            className="w-full sm:w-auto rounded-xl border-2 border-red-200 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 hover:border-red-300 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={handleInstagramDisconnect}
                            disabled={instagramDisconnecting || isPageDisabled}
                          >
                            {instagramDisconnecting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                {t("integrations.disconnecting")}
                              </span>
                            ) : (
                              t("integrations.disconnect")
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {!instagramChecking && !instagramIntegration && (
                      <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          {t("integrations.clickConnectToLinkInstagram")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom accent line with animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-sky-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {" "}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Telegram Connection Modal */}
      {showTelegramModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !telegramConnecting) {
              handleCloseTelegramModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="rounded-t-xl bg-gradient-to-br from-[#0b1220] to-[#1a1f35] text-white px-4 py-3 mb-2 flex items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold">
                  {t("integrations.connectTelegram")}
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  {t("integrations.enterBotToken")}
                </p>
              </div>
              <button
                onClick={handleCloseTelegramModal}
                disabled={telegramConnecting}
                className="rounded-md border border-transparent px-2 py-1 text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {telegramError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">⚠️</div>
                    <div>{telegramError}</div>
                  </div>
                </div>
              )}

              {telegramSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">✓</div>
                    <div>{t("integrations.telegram.connectSuccess")}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("integrations.telegramBotTokenLabel")}
                </label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => {
                    setTelegramBotToken(e.target.value);
                    setTelegramError(null);
                  }}
                  placeholder={t("integrations.telegramBotTokenPlaceholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={telegramConnecting || isPageDisabled}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      telegramBotToken.trim() &&
                      !telegramConnecting &&
                      !isPageDisabled
                    ) {
                      handleTelegramSubmit();
                    }
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t("integrations.telegram.getToken")}{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline font-medium"
                  >
                    {t("integrations.telegram.botFather")}
                  </a>{" "}
                  {t("integrations.telegram.onTelegram")}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  onClick={handleTelegramSubmit}
                  disabled={
                    !telegramBotToken.trim() ||
                    telegramConnecting ||
                    isPageDisabled
                  }
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {telegramConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("integrations.connecting")}
                    </>
                  ) : (
                    t("integrations.connect")
                  )}
                </button>
                <button
                  onClick={handleCloseTelegramModal}
                  disabled={telegramConnecting || isPageDisabled}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("integrations.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
