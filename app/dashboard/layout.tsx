"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Link2,
  BarChart3,
  Settings,
  Bell,
  User as UserIcon,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <Link
                href="/"
                className="text-xl font-extrabold tracking-tight text-gray-900"
              >
                YETTI<span className="text-gray-400">.AI</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
<<<<<<< yetti-ui
                href="/dashboard"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
=======
                href={buildLink("/dashboard")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
>>>>>>> local
              >
                <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
              </Link>
              <Link
<<<<<<< yetti-ui
                href="/dashboard/agents"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                <span className="mr-3">🤖</span>
                AI Agents
              </Link>
              <Link
                href="/dashboard/integrations"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
=======
                href={buildLink("/dashboard/chat")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/chat")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-3" /> Chat
              </Link>
              <Link
                href={buildLink("/dashboard/knowledge-base")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/knowledge-base")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-3" /> Knowledge Base
              </Link>
              <Link
                href={buildLink("/dashboard/integrations")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/integrations")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
>>>>>>> local
              >
                <Link2 className="w-4 h-4 mr-3" /> Integrations
              </Link>
              <Link
<<<<<<< yetti-ui
                href="/dashboard/analytics"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
=======
                href={buildLink("/dashboard/analytics")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/analytics")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
>>>>>>> local
              >
                <BarChart3 className="w-4 h-4 mr-3" /> Analytics
              </Link>
              <Link
<<<<<<< yetti-ui
                href="/dashboard/settings"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
=======
                href={buildLink("/dashboard/settings")}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/settings")
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
>>>>>>> local
              >
                <Settings className="w-4 h-4 mr-3" /> Settings
              </Link>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                  {(user?.user_metadata?.first_name?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U") as string}
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
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link
                href="/profile"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserIcon className="w-5 h-5" />
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
