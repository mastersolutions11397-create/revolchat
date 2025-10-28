"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const INTEGRATION_PLATFORMS = [
  {
    name: "Instagram",
    icon: "📷",
    color: "from-pink-500 to-purple-500",
    available: true,
  },
  {
    name: "Telegram",
    icon: "💬",
    color: "from-blue-500 to-cyan-500",
    available: true,
  },
  {
    name: "WhatsApp",
    icon: "📱",
    color: "from-green-500 to-emerald-500",
    available: true,
  },
  {
    name: "Discord",
    icon: "💜",
    color: "from-indigo-500 to-purple-500",
    available: true,
  },
  {
    name: "Twitter",
    icon: "🐦",
    color: "from-blue-400 to-blue-600",
    available: false,
  },
  {
    name: "Facebook Messenger",
    icon: "💙",
    color: "from-blue-600 to-blue-800",
    available: false,
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch integrations from API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">
            Connect your AI agents to messaging platforms
          </p>
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="yeti-card rounded-xl p-6 yeti-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${
                        integration.color || "from-gray-500 to-gray-600"
                      } rounded-lg flex items-center justify-center`}
                    >
                      <span className="text-2xl">{integration.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {integration.platform}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {integration.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      integration.is_active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-sm px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Configure
                  </button>
                  <button className="flex-1 text-sm px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Platforms
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading integrations...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className={`yeti-card rounded-xl p-6 yeti-shadow transition-all ${
                  platform.available
                    ? "hover:shadow-lg cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                  </div>
                  {!platform.available && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {platform.available
                    ? "Connect your account to start using"
                    : "Integration will be available soon"}
                </p>
                {platform.available && (
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all text-sm">
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
