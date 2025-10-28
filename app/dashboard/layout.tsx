"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-md border-r border-purple-100">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-purple-100">
              <Link
                href="/"
                className="text-xl font-bold yeti-gradient bg-clip-text text-transparent"
              >
                🧊 Yeti AI
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard")
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
              <Link
                href="/dashboard/agents"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/agents")
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <span className="mr-3">🤖</span>
                AI Agents
              </Link>
              <Link
                href="/dashboard/integrations"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/integrations")
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <span className="mr-3">🔗</span>
                Integrations
              </Link>
              <Link
                href="/dashboard/analytics"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/analytics")
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <span className="mr-3">📈</span>
                Analytics
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/settings")
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <span className="mr-3">⚙️</span>
                Settings
              </Link>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.user_metadata?.first_name?.[0] ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.first_name &&
                    user?.user_metadata?.last_name
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                      : user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-3 text-left px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
              </button>
              <Link
                href="/profile"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">👤</span>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
