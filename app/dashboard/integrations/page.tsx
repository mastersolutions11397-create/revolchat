"use client";

import Image from "next/image";
import { Link2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { integrationsAPI } from "@/lib/api";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

type InstagramIntegration = {
  username: string;
  profile_picture: string | null;
};

const CHANNELS = [
  {
    name: "Instagram",
    description:
      "Connect Instagram to provide real-time support when customers reach out.",
    icon: "/yetti/instagram.png",
    fallbackIcon: "💬",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: false,
  },
  {
    name: "Telegram",
    description:
      "Connect Telegram Bot to provide real-time support when customers reach out.",
    icon: "/yetti/telegram_1.png",
    fallbackIcon: "✈️",
    gradient: "from-[#ebf1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: false,
  },
  {
    name: "Messenger",
    description:
      "Connect Messenger to enable customer support and engagement directly.",
    icon: "/yetti/messenger.png",
    fallbackIcon: "📞",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
    comingSoon: true,
  },

  {
    name: "WhatsApp",
    description:
      "Connect WhatsApp Cloud API and manage your messages easily in one place.",
    icon: "/yetti/social.png",
    fallbackIcon: "📱",
    gradient: "from-[#ecfff1] via-white to-white",
    iconOpacity: "opacity-50",
    comingSoon: true,
  },
];

export default function IntegrationsPage() {
  const { selectedWorkspaceId, currentWorkspace } = useWorkspace();
  const workspaceId = useMemo(
    () => selectedWorkspaceId || currentWorkspace?.id || null,
    [selectedWorkspaceId, currentWorkspace?.id]
  );

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

  useEffect(() => {
    let cancelled = false;

    async function checkInstagramConnection() {
      if (!workspaceId) {
        setInstagramIntegration(null);
        setInstagramStatusMessage(null);
        setInstagramStatusKind(null);
        return;
      }

      setInstagramChecking(true);
      setInstagramStatusMessage(null);
      setInstagramStatusKind(null);

      try {
        const data = await integrationsAPI.getInstagramIntegration(workspaceId);
        if (cancelled) return;

        if (data) {
          setInstagramIntegration(data);
        } else {
          setInstagramIntegration(null);
        }
      } catch (error: any) {
        if (cancelled) return;
        setInstagramIntegration(null);
        setInstagramStatusMessage(
          error?.message || "Unable to verify Instagram connection."
        );
      } finally {
        if (!cancelled) {
          setInstagramChecking(false);
        }
      }
    }

    checkInstagramConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInstagramConnect = useCallback(() => {
    if (!workspaceId) {
      window.alert("Please select a workspace before connecting Instagram.");
      return;
    }

    if (instagramIntegration) {
      window.alert(
        `Instagram account "${instagramIntegration.username}" is already connected.`
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
      `Disconnect Instagram account "${instagramIntegration.username}"?`
    );
    if (!confirmed) return;

    setInstagramDisconnecting(true);
    setInstagramStatusMessage(null);
    setInstagramStatusKind(null);

    try {
      await integrationsAPI.disconnectInstagramIntegration(workspaceId);
      setInstagramIntegration(null);
      setInstagramStatusMessage("Instagram account disconnected.");
      setInstagramStatusKind("success");
    } catch (error: any) {
      setInstagramStatusMessage(
        error?.message || "Failed to disconnect Instagram."
      );
      setInstagramStatusKind("error");
    } finally {
      setInstagramDisconnecting(false);
    }
  }, [workspaceId, instagramIntegration]);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-[#0b1220] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="text-white/70 text-sm">
              Deploy your agent across the channels your customers already use.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {CHANNELS.map((channel) => (
          <div
            key={channel.name}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-sky-50/50 to-white p-6"
          >
            <div className="relative h-full flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {channel.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {channel.description}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full">
                  <Image
                    src={channel.icon}
                    alt={channel.name}
                    width={120}
                    height={120}
                    className={`h-16 w-16 object-contain ${channel.iconOpacity}`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                </div>
              </div>
              <div className="mt-auto flex justify-end pt-6">
                <button
                  type="button"
                  className={`rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold transition-colors ${
                    channel.comingSoon
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white text-sky-700 hover:bg-gray-50"
                  }`}
                  disabled={
                    channel.comingSoon ||
                    (channel.name === "Instagram" &&
                      (instagramChecking || instagramDisconnecting))
                  }
                  onClick={() => {
                    if (channel.comingSoon) return;
                    if (channel.name === "Instagram") {
                      handleInstagramConnect();
                    }
                  }}
                >
                  {channel.comingSoon
                    ? "Coming Soon"
                    : channel.name === "Instagram" && instagramIntegration
                      ? "Connected"
                      : "Connect"}
                </button>
              </div>
              {channel.name === "Instagram" && (
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {instagramChecking && (
                    <p className="text-gray-500">Checking Instagram status…</p>
                  )}
                  {!instagramChecking && instagramStatusMessage && (
                    <p
                      className={
                        instagramStatusKind === "success"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      {instagramStatusMessage}
                    </p>
                  )}
                  {!instagramChecking && instagramIntegration && (
                    <div className="flex flex-col gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                          {instagramIntegration.profile_picture ? (
                            <Image
                              src={instagramIntegration.profile_picture}
                              alt={instagramIntegration.username}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-base font-semibold text-sky-600">
                              {instagramIntegration.username
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-sky-600">Connected as</p>
                          <p className="font-semibold text-gray-900">
                            {instagramIntegration.username}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-fit rounded-lg border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={handleInstagramDisconnect}
                        disabled={instagramDisconnecting}
                      >
                        {instagramDisconnecting
                          ? "Disconnecting..."
                          : "Disconnect Instagram"}
                      </button>
                    </div>
                  )}
                  {!instagramChecking && !instagramIntegration && (
                    <p className="text-gray-500">
                      Not connected to Instagram yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
