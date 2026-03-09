"use client";

import Image from "next/image";
import Link from "next/link";
import { Link2, Bot, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

// Future platforms - all coming soon
const CHANNELS = [
  {
    name: "Instagram",
    description: "Connect your Instagram Business account to manage DMs",
    icon: "/yetti/instagram_logo.png",
    fallbackIcon: "📸",
    comingSoon: true,
    gradient: "from-pink-500 to-purple-500",
  },
  {
    name: "WhatsApp",
    description: "Connect WhatsApp Business API for customer messaging",
    icon: "/yetti/whatsapp_logo.png",
    fallbackIcon: "💬",
    comingSoon: true,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Messenger",
    description: "Connect Facebook Messenger for automated responses",
    icon: "/yetti/messenger_logo.png",
    fallbackIcon: "💭",
    comingSoon: true,
    gradient: "from-blue-500 to-indigo-500",
  },
];

export default function IntegrationsPage() {
  const { t } = useLanguage();

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

      {/* Telegram moved notice */}
      <Link
        href="/dashboard/bots"
        className="group block relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0088cc]/10 to-teal-primary/10 border-2 border-[#0088cc]/20 p-5 sm:p-6 hover:border-[#0088cc]/40 transition-all"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0088cc]/10">
            <Image
              src="/yetti/telegram_logo.png"
              alt="Telegram"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                Telegram Bots
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-primary/10 text-teal-primary">
                <Bot className="h-3 w-3" />
                New Location
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Telegram bot management has moved to the{" "}
              <span className="font-medium text-teal-primary">Bots page</span>.
              Create bots with AI integration, custom profile pictures, and more.
            </p>
          </div>
          <div className="flex items-center gap-2 text-teal-primary font-medium text-sm group-hover:gap-3 transition-all">
            Go to Bots
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* Coming Soon Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          Coming Soon
          <span className="text-xs font-normal text-slate-500">
            More platforms on the way
          </span>
        </h2>

        <div
          data-tour="integrations-page"
          className="grid gap-4 sm:gap-6 animate-in fade-in duration-300"
        >
          {CHANNELS.map((channel, index) => (
            <div
              key={channel.name}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-dashboard-card border border-dashboard-border opacity-60 cursor-not-allowed"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dashboard-bg via-dashboard-card to-slate-100 opacity-60"></div>

              <div className="relative p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-slate-100 shadow-sm ring-1 ring-dashboard-border">
                      {channel.icon ? (
                        <Image
                          src={channel.icon}
                          alt={channel.name}
                          width={48}
                          height={48}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain grayscale opacity-50"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            if (target.nextElementSibling) {
                              target.nextElementSibling.classList.remove(
                                "hidden"
                              );
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl opacity-50">
                          {channel.fallbackIcon}
                        </span>
                      )}
                      <span className="hidden text-2xl sm:text-3xl opacity-50">
                        {channel.fallbackIcon}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-400">
                        {channel.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-200/50">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {channel.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
