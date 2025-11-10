"use client";

import Image from "next/image";

const CHANNELS = [
  {
    name: "Telegram",
    description:
      "Connect Telegram Bot to provide real-time support when customers reach out.",
    icon: "/integrations/telegram.png",
    fallbackIcon: "✈️",
    gradient: "from-[#e8f1ff] via-white to-white",
  },
  {
    name: "Viber",
    description:
      "Connect Viber Bot to enable customer support and engagement on Viber.",
    icon: "/integrations/viber.png",
    fallbackIcon: "📞",
    gradient: "from-[#f2ecff] via-white to-white",
  },
  {
    name: "LINE",
    description:
      "Connect LINE Official Account to provide timely support to your customers.",
    icon: "/integrations/line.png",
    fallbackIcon: "💬",
    gradient: "from-[#ecfff1] via-white to-white",
  },
  {
    name: "WhatsApp Cloud API",
    description:
      "Connect WhatsApp Cloud API and manage your messages easily in one place.",
    icon: "/integrations/whatsapp.png",
    fallbackIcon: "📱",
    gradient: "from-[#ebf1ff] via-white to-white",
  },
  {
    name: "Custom Channel",
    description:
      "Connect any channels not natively available to expand your customer reach.",
    icon: "/integrations/custom.png",
    fallbackIcon: "🧩",
    gradient: "from-[#fff6eb] via-white to-white",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Deploy your agent across the channels your customers already use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {CHANNELS.map((channel) => (
          <div
            key={channel.name}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${channel.gradient} opacity-90`}
            />
            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {channel.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {channel.description}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                  <Image
                    src={channel.icon}
                    alt={channel.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <span className="hidden text-xl" aria-hidden>
                    {channel.fallbackIcon}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex justify-end pt-6">
                <button className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50">
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
