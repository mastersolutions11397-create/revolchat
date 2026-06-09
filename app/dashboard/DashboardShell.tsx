"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  LayoutDashboard,
  Link2,
  Settings,
  Bell,
  Loader2,
  LogOut,
  MessageSquare,
  Menu,
  X,
  Zap,
  Bot,
  Building2,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Brain,
} from "lucide-react";

function WorkspaceSelector() {
  // This component is handled by the main DashboardContent component
  // Keeping it here for backwards compatibility but functionality is in DashboardContent
  return null;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const {
    workspaces,
    activeWorkspace,
    loading: workspaceLoading,
    onboardingOpen,
    setOnboardingOpen,
    setActiveWorkspaceId,
    createWorkspace,
  } = useWorkspace();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

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

  const handleCreateWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newWorkspaceName.trim();
    if (!name) return;
    setCreatingWorkspace(true);
    try {
      await createWorkspace(name);
      setNewWorkspaceName("");
      setWorkspaceMenuOpen(false);
    } finally {
      setCreatingWorkspace(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-background">
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
        className={`fixed inset-y-0 left-0 z-50 bg-surface border-r border-border transition-all duration-300 ease-in-out shadow-sm ${
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
          {/* Logo + Toggle */}
          <div className="flex h-16 items-center border-b border-border px-3 gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2.5 min-w-0 flex-1 ${!sidebarExpanded && !mobileSidebarOpen ? "justify-center" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              {(sidebarExpanded || mobileSidebarOpen) && (
                <span className="text-lg font-bold text-text-primary truncate">Revolchat</span>
              )}
            </Link>
            {/* Mobile close */}
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
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
              {
                href: "/dashboard/crm",
                icon: Users,
                label: "CRM",
                tourId: null,
              },
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
              {
                href: "/dashboard/workspaces",
                icon: Users,
                label: "Workspaces",
                tourId: null,
              },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={buildLink(item.href)}
                  onClick={handleNavClick}
                  className={`group flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-text-muted hover:bg-background hover:text-text-primary"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? "text-brand" : "text-text-muted group-hover:text-text-primary"
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
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4 bg-background">
            <div
              className={`flex items-center gap-3 ${!sidebarExpanded && !mobileSidebarOpen && "justify-center"}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-md shadow-brand/20">
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
                <p className="truncate text-sm font-semibold text-text-primary">
                  {user?.user_metadata?.first_name &&
                  user?.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email?.split("@")[0]}
                </p>
                <p className="truncate text-xs text-text-muted">{user?.email}</p>
              </div>
              {(sidebarExpanded || mobileSidebarOpen) && (
                <button
                  onClick={handleSignOut}
                  className="ml-auto rounded-lg p-2 text-text-muted hover:bg-surface hover:text-red-500 hover:shadow-sm transition-all"
                  title={t("dashboard.sidebar.signOut")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`min-w-0 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "md:pl-72" : "md:pl-20"
        } pl-0`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 md:h-20 items-center justify-between border-b border-border bg-surface/80 px-3 sm:px-4 md:px-6 lg:px-8 backdrop-blur-xl transition-all gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Burger Menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors shrink-0"
              aria-label={t("dashboard.workspaceSelector.openSidebar")}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen((value) => !value)}
                className="flex max-w-[220px] items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm shadow-sm transition hover:border-brand/40"
              >
                <Building2 className="h-4 w-4 shrink-0 text-brand" />
                <span className="truncate font-semibold text-text-primary">
                  {workspaceLoading
                    ? "Loading..."
                    : activeWorkspace?.name ?? "No workspace"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-xl">
                  <div className="max-h-60 overflow-y-auto">
                    {workspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkspaceId(workspace.id);
                          setWorkspaceMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          activeWorkspace?.id === workspace.id
                            ? "bg-brand/10 text-brand"
                            : "text-text-secondary hover:bg-background"
                        }`}
                      >
                        <span className="truncate font-medium">{workspace.name}</span>
                        <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-[11px] uppercase text-text-muted">
                          {workspace.role}
                        </span>
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleCreateWorkspace} className="mt-2 border-t border-border pt-2">
                    <input
                      value={newWorkspaceName}
                      onChange={(event) => setNewWorkspaceName(event.target.value)}
                      placeholder="New workspace name"
                      className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                    <button
                      type="submit"
                      disabled={creatingWorkspace || !newWorkspaceName.trim()}
                      className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {creatingWorkspace ? "Creating..." : "Create workspace"}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <button
              className="relative rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-2.5 text-text-muted transition-all hover:bg-brand/10 hover:text-brand shrink-0"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 sm:top-1.5 md:top-2 right-1 sm:right-1.5 md:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brand ring-1 sm:ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          key={activeWorkspace?.id ?? "no-workspace"}
          className="min-w-0 w-full p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in-up"
        >
          {children}
        </main>

      </div>

      {onboardingOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Name your workspace</h2>
            <p className="mt-1 text-sm text-text-muted">
              This is where your bots, members, integrations, and inbox will live.
            </p>
            <form onSubmit={handleCreateWorkspace} className="mt-5 space-y-4">
              <input
                autoFocus
                value={newWorkspaceName}
                onChange={(event) => setNewWorkspaceName(event.target.value)}
                placeholder="Acme Support"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="submit"
                disabled={creatingWorkspace || !newWorkspaceName.trim()}
                className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-brand-light disabled:opacity-60"
              >
                {creatingWorkspace ? "Creating..." : "Create workspace"}
              </button>
            </form>
            {workspaces.length > 0 && (
              <button
                type="button"
                onClick={() => setOnboardingOpen(false)}
                className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-background"
              >
                Do this later
              </button>
            )}
          </div>
        </div>
      )}
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
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <WorkspaceSelector />
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
