"use client";

import Image from "next/image";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { Link2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { integrationsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";

// CHANNELS - only Telegram (Instagram, WhatsApp, Messenger removed)
const CHANNELS = [
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
];

// Skeleton Loader Component
function IntegrationSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-dashboard-card border border-dashboard-border shadow-lg animate-pulse">
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
      <div className="bg-dashboard-card rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[200px]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-primary/20"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-teal-primary border-t-transparent animate-spin"></div>
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
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramConnecting, setTelegramConnecting] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramSuccess, setTelegramSuccess] = useState(false);
  const [telegramBots, setTelegramBots] = useState<
    { username: string; first_name: string }[]
  >([]);
  const [telegramChecking, setTelegramChecking] = useState(false);
  const hasFetched = useRef(false);

  const fetchIntegrations = useCallback(async (force = false) => {
    if (!force && hasFetched.current) return;
    hasFetched.current = true;
    setInitialLoading(true);
    setTelegramChecking(true);
    try {
      const telegramData = await integrationsAPI.getTelegramBotInfo();
      if (telegramData?.username) {
        setTelegramBots([{
          username: telegramData.username,
          first_name: telegramData.first_name || "",
        }]);
      } else {
        setTelegramBots([]);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      setTelegramBots([]);
    } finally {
      setTelegramChecking(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setTelegramBots([]);
      hasFetched.current = false;
      setInitialLoading(false);
      return;
    }
    fetchIntegrations();
  }, [user?.id, fetchIntegrations]);

  useEffect(() => {
    const handleFocus = () => {
      if (user) fetchIntegrations(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id, fetchIntegrations]);

  const handleTelegramConnect = useCallback(() => {
    if (!user?.id) {
      window.alert(t("integrations.loginRequired"));
      return;
    }
    setShowTelegramModal(true);
    setTelegramBotToken("");
    setTelegramError(null);
    setTelegramSuccess(false);
  }, [user?.id, t]);

  const handleTelegramSubmit = useCallback(async () => {
    if (!user?.id) {
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
      });
      setTelegramSuccess(true);
      setTelegramBotToken("");
      await fetchIntegrations(true);
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
  }, [user?.id, telegramBotToken, fetchIntegrations, t]);

  const handleCloseTelegramModal = useCallback(() => {
    setShowTelegramModal(false);
    setTelegramBotToken("");
    setTelegramError(null);
    setTelegramSuccess(false);
  }, []);

  const isPageLoading = initialLoading;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800 p-6 sm:p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-teal-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20 flex-shrink-0">
            <Link2 className="h-7 w-7 sm:h-8 sm:w-8 text-teal-accent" />
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
          className={`grid gap-4 sm:gap-6 transition-all duration-300 ${false ? "opacity-60 pointer-events-none" : "animate-in fade-in duration-300"}`}
        >
          {CHANNELS.map((channel, index) => (
            <div
              key={channel.name}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-dashboard-card border border-dashboard-border hover:border-teal-accent transition-all duration-300 shadow-lg hover:shadow-2xl"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-dashboard-bg via-dashboard-card to-teal-primary/5 opacity-60"></div>

              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-primary/0 via-teal-primary/10 to-teal-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-4 sm:p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 mb-6">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 w-full sm:w-auto">
                    {/* Icon with glow effect */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-primary to-teal-accent rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-dashboard-card to-teal-primary/10 shadow-md ring-1 ring-dashboard-border group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
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
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-teal-primary transition-colors">
                          {channel.nameKey ? t(channel.nameKey) : channel.name}
                        </h3>
                        {channel.nameKey === "integrations.telegram" &&
                          telegramBots.length > 0 && (
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

                  {/* Right: Connect Button (with Plus for multiple Telegram bots) */}
                  <div className="flex-shrink-0 w-full sm:w-auto flex items-center gap-2">
                    {channel.nameKey === "integrations.telegram" && (
                      <button
                        type="button"
                        className={`rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold transition-all duration-300 shadow-md inline-flex items-center justify-center gap-2 ${
                          channel.comingSoon || false
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                            : "bg-teal-primary text-white shadow-teal-primary/30 hover:bg-teal-accent hover:shadow-teal-primary/50 hover:scale-105"
                        }`}
                        disabled={
                          channel.comingSoon ||
                          false ||
                          telegramConnecting ||
                          telegramChecking
                        }
                        onClick={() => {
                          if (channel.comingSoon || false) return;
                          if (channel.name === "Telegram") {
                            handleTelegramConnect();
                          }
                        }}
                      >
                        {channel.comingSoon ? (
                          t("integrations.comingSoon")
                        ) : telegramConnecting || telegramChecking ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {telegramChecking
                              ? t("integrations.checking")
                              : t("integrations.connecting")}
                          </span>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            {telegramBots.length > 0
                              ? t("integrations.connectAnother")
                              : t("integrations.connect")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Telegram Connection Details */}
                {channel.nameKey === "integrations.telegram" && (
                  <div className="space-y-3">
                    {telegramChecking && (
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-teal-primary/5 border border-teal-primary/20 animate-pulse">
                        <div className="relative flex-shrink-0">
                          <div className="h-5 w-5 rounded-full border-2 border-teal-primary/20"></div>
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-teal-primary border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium">
                          {t("integrations.telegram.checkingStatus")}
                        </p>
                      </div>
                    )}

                    {!telegramChecking && telegramBots.length > 0 && (
                      <div className="space-y-3">
                        {telegramBots.map((bot) => (
                          <div
                            key={bot.username}
                            className="relative overflow-hidden rounded-2xl border border-teal-primary/20 bg-gradient-to-br from-teal-primary/5 to-dashboard-card p-4 sm:p-5 shadow-inner"
                          >
                            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-teal-primary/20 to-transparent rounded-full blur-2xl" />
                            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-teal-primary to-teal-accent rounded-full blur-sm opacity-75" />
                                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full bg-dashboard-card ring-4 ring-white shadow-lg flex items-center justify-center">
                                    <div className="text-xl sm:text-2xl">🤖</div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-teal-primary uppercase tracking-wider mb-0.5">
                                    {t("integrations.connectedBot")}
                                  </p>
                                  <p className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                                    @{bot.username}
                                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-primary" />
                                  </p>
                                  {bot.first_name && (
                                    <p className="text-xs sm:text-sm text-slate-600">
                                      {bot.first_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!telegramChecking && telegramBots.length === 0 && (
                      <div className="p-3 sm:p-4 rounded-xl bg-dashboard-bg border border-dashboard-border">
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          {t("integrations.telegram.connectBot")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom accent line with animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-teal-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
          <div className="w-full max-w-md rounded-2xl border border-dashboard-border bg-dashboard-card shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-4 py-3 border border-dashboard-border rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-teal-primary transition-all disabled:bg-dashboard-bg disabled:cursor-not-allowed"
                  disabled={telegramConnecting || false}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      telegramBotToken.trim() &&
                      !telegramConnecting &&
                      !false
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
                    className="text-teal-primary hover:underline font-medium"
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
                    false
                  }
                  className="flex-1 bg-teal-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-teal-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  disabled={telegramConnecting || false}
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
