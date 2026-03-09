"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  LayoutDashboard,
  BookOpen,
  Link2,
  Settings,
  Bell,
  Loader2,
  LogOut,
  MessageSquare,
  Menu,
  X,
  Gift,
  Zap,
  Bot,
} from "lucide-react";

function WorkspaceSelector() {
  // This component is handled by the main DashboardContent component
  // Keeping it here for backwards compatibility but functionality is in DashboardContent
  return null;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  const handleNavClick = () => {
    setMobileSidebarOpen(false);
  };

  const buildLink = (path: string) => path;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-dashboard-bg">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-dashboard-card border-r border-dashboard-border transition-all duration-300 ease-in-out shadow-sm ${
          // Mobile: always full width when open, hidden when closed
          mobileSidebarOpen ? "w-72 translate-x-0" : "-translate-x-full"
        } ${
          // Desktop: visible always, width based on expanded state
          sidebarExpanded
            ? "md:w-72 md:translate-x-0"
            : "md:w-20 md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-dashboard-border px-3 md:px-6">
            {/* Expanded sidebar logo */}
            {(sidebarExpanded || mobileSidebarOpen) && (
              <Link
                href="/"
                className="flex items-center gap-3 transition-all duration-300"
              >
                <Image
                  src="/yetti/logo2.jpg"
                  alt="Admin Logo"
                  width={40}
                  height={40}
                  className="shrink-0"
                />
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Admin
                </div>
              </Link>
            )}

            {/* Collapsed sidebar logo - centered */}
            {!sidebarExpanded && !mobileSidebarOpen && (
              <Link
                href="/"
                className="flex items-center justify-center w-full"
              >
                <Image
                  src="/yetti/logo2.jpg"
                  alt="Admin Logo"
                  width={48}
                  height={48}
                  className="shrink-0"
                />
              </Link>
            )}

            {/* Mobile Close Button */}
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-auto p-2 rounded-lg text-slate-400 hover:bg-dashboard-bg hover:text-slate-900 transition-colors"
                aria-label={t("dashboard.workspaceSelector.closeSidebar")}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {[
              {
                href: "/dashboard",
                icon: LayoutDashboard,
                label: t("dashboard.sidebar.dashboard"),
                tourId: null,
              },
              {
                href: "/dashboard/inbox",
                icon: MessageSquare,
                label: t("dashboard.sidebar.inbox"),
                tourId: null,
              },
              {
                href: "/dashboard/bots",
                icon: Bot,
                label: "Bots",
                tourId: "bots-nav",
              },
              {
                href: "/dashboard/integrations",
                icon: Link2,
                label: t("dashboard.sidebar.integrations"),
                tourId: "integrations-nav",
              },
              {
                href: "/dashboard/triggers",
                icon: Zap,
                label: "Triggers",
                tourId: null,
              },
              // Plans - hidden for now
              // {
              //   href: "/dashboard/plans",
              //   icon: Crown,
              //   label: t("dashboard.sidebar.plans"),
              //   tourId: "plans-nav",
              // },
              // Billing - hidden for now
              // {
              //   href: "/dashboard/billing",
              //   icon: CreditCard,
              //   label: t("dashboard.sidebar.billing"),
              //   tourId: null,
              // },
              // Affiliate - hidden for now
              // {
              //   href: "/dashboard/affiliate",
              //   icon: Gift,
              //   label: "Affiliates",
              //   tourId: null,
              // },
              // Usage - hidden for now
              // {
              //   href: "/dashboard/usage",
              //   icon: Activity,
              //   label: t("dashboard.sidebar.usage"),
              //   tourId: null,
              // },
              {
                href: "/dashboard/settings",
                icon: Settings,
                label: t("dashboard.sidebar.settings"),
                tourId: "settings-nav",
              },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={buildLink(item.href)}
                  onClick={handleNavClick}
                  className={`group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                    active
                      ? "bg-teal-primary/10 text-teal-primary shadow-sm ring-1 ring-teal-primary/20"
                      : "text-slate-600 hover:bg-dashboard-bg hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active
                        ? "text-teal-primary"
                        : "text-slate-400 group-hover:text-slate-600"
                    } ${sidebarExpanded || mobileSidebarOpen ? "mr-3" : "mx-auto"}`}
                  />
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      sidebarExpanded || mobileSidebarOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (sidebarExpanded || mobileSidebarOpen) && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-teal-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-dashboard-border p-4 bg-dashboard-bg">
            <div
              className={`flex items-center gap-3 ${!sidebarExpanded && !mobileSidebarOpen && "justify-center"}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-primary text-sm font-bold text-white shadow-md shadow-teal-primary/20">
                {
                  (user?.user_metadata?.first_name?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U") as string
                }
              </div>
              <div
                className={`min-w-0 transition-all duration-300 ${
                  sidebarExpanded || mobileSidebarOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.user_metadata?.first_name &&
                  user?.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email?.split("@")[0]}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              {(sidebarExpanded || mobileSidebarOpen) && (
                <button
                  onClick={handleSignOut}
                  className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-dashboard-card hover:text-red-500 hover:shadow-sm transition-all"
                  title={t("dashboard.sidebar.signOut")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Toggle Button - Hidden as sidebar now opens on hover */}
        {/* <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="hidden md:flex absolute -right-3 top-24 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:text-sky-500 hover:border-sky-200 transition-all z-10"
        >
          {sidebarExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button> */}
      </aside>

      {/* Main Content */}
      <div
        className={`min-w-0 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "md:pl-72" : "md:pl-20"
        } pl-0`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 md:h-20 items-center justify-between border-b border-dashboard-border bg-dashboard-card/80 px-3 sm:px-4 md:px-6 lg:px-8 backdrop-blur-xl transition-all gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Burger Menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              aria-label={t("dashboard.workspaceSelector.openSidebar")}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <button
              className="relative rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-2.5 text-slate-500 transition-all hover:bg-teal-primary/10 hover:text-teal-primary shrink-0"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 sm:top-1.5 md:top-2 right-1 sm:right-1.5 md:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-teal-primary ring-1 sm:ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 w-full p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in-up">{children}</main>

      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-dashboard-bg">
          <Loader2 className="h-8 w-8 animate-spin text-teal-primary" />
        </div>
      }
    >
      <WorkspaceSelector />
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
