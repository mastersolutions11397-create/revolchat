"use client";

import Image from "next/image";
import { Link2 } from "lucide-react";

const CHANNELS = [
  {
    name: "Facebook",
    description:
      "Connect Facebook Messenger to provide real-time support when customers reach out.",
    icon: "/yetti/communication.png",
    fallbackIcon: "💬",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
  },
  {
    name: "Messenger",
    description:
      "Connect Messenger to enable customer support and engagement directly.",
    icon: "/yetti/messenger.png",
    fallbackIcon: "📞",
    gradient: "from-[#e8f1ff] via-white to-white",
    iconOpacity: "opacity-100",
  },
  {
    name: "Telegram",
    description:
      "Connect Telegram Bot to provide real-time support when customers reach out.",
    icon: "/yetti/telegram_1.png",
    fallbackIcon: "✈️",
    gradient: "from-[#ebf1ff] via-white to-white",
    iconOpacity: "opacity-100",
  },
  {
    name: "WhatsApp",
    description:
      "Connect WhatsApp Cloud API and manage your messages easily in one place.",
    icon: "/yetti/social.png",
    fallbackIcon: "📱",
    gradient: "from-[#ecfff1] via-white to-white",
    iconOpacity: "opacity-50",
  },
];

export default function IntegrationsPage() {
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
                <button className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-gray-50">
                  Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
