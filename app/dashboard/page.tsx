export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, John! 👋
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your AI agents today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-lg font-semibold text-gray-900">2 minutes ago</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Messages
              </p>
              <p className="text-2xl font-bold text-gray-900">12,543</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💬</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              +12% from last week
            </span>
          </div>
        </div>

        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              +2 this month
            </span>
          </div>
        </div>

        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Integrations</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🔗</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              All systems operational
            </span>
          </div>
        </div>

        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">0.8s</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              -0.2s improvement
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="yeti-card rounded-2xl p-8 yeti-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Instagram bot responded to 25 messages
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Telegram integration updated
                </p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New AI agent deployed
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  WhatsApp integration needs attention
                </p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="yeti-card rounded-2xl p-8 yeti-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all">
              <div className="text-center">
                <span className="text-2xl block mb-2">🤖</span>
                <span className="text-sm font-medium">Create Agent</span>
              </div>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all">
              <div className="text-center">
                <span className="text-2xl block mb-2">🔗</span>
                <span className="text-sm font-medium">Add Integration</span>
              </div>
            </button>
            <button className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all">
              <div className="text-center">
                <span className="text-2xl block mb-2">📊</span>
                <span className="text-sm font-medium">View Analytics</span>
              </div>
            </button>
            <button className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all">
              <div className="text-center">
                <span className="text-2xl block mb-2">⚙️</span>
                <span className="text-sm font-medium">Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Status */}
      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Platform Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium text-gray-900">Instagram</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium text-gray-900">Telegram</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚠</span>
              </div>
              <span className="font-medium text-gray-900">WhatsApp</span>
            </div>
            <span className="text-sm text-yellow-600 font-medium">Issues</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium text-gray-900">Discord</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
