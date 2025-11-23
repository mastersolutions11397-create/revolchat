"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  LayoutDashboard,
  BookOpen,
  Link2,
  Settings,
  Bell,
  Loader2,
  User as UserIcon,
  CalendarClock,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
} from "lucide-react";
import { yettiOnboardingAPI } from "@/lib/api";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";

function WorkspaceSelector() {
  const searchParams = useSearchParams();
  const { selectWorkspace } = useWorkspace();

  useEffect(() => {
    const ws = searchParams.get("ws");
    if (ws) {
      selectWorkspace(ws).catch((err) =>
        console.error("Failed to select workspace:", err)
      );
    }
  }, [searchParams, selectWorkspace]);

  return null;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    selectedWorkspaceId,
    workspaces,
    selectWorkspace,
    fetchWorkspaces,
    loading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [localWorkspaceSelection, setLocalWorkspaceSelection] = useState<string>(
    selectedWorkspaceId ?? ""
  );
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);
  const [workspaceSwitchError, setWorkspaceSwitchError] = useState<string | null>(
    null
  );
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<{
    id: string;
    name?: string;
  } | null>(null);
  const previousWorkspaceIdRef = useRef<string | null>(selectedWorkspaceId);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  const buildLink = (path: string) => {
    let workspaceId = selectedWorkspaceId || searchParams.get("ws");
    if (!workspaceId && typeof window !== "undefined") {
      try {
        const val = localStorage.getItem("selectedWorkspaceId");
        if (val && val !== "undefined" && val !== "null") {
          workspaceId = val;
        }
      } catch {}
    }
    if (workspaceId) return `${path}?ws=${encodeURIComponent(workspaceId)}`;
    return path;
  };

  useEffect(() => {
    setLocalWorkspaceSelection(selectedWorkspaceId ?? "");
    previousWorkspaceIdRef.current = selectedWorkspaceId ?? null;
  }, [selectedWorkspaceId]);

  const handleWorkspaceChange = async (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const newWorkspaceId = event.target.value;
    const previousWorkspaceId = previousWorkspaceIdRef.current;

    setLocalWorkspaceSelection(newWorkspaceId);
    setWorkspaceSwitchError(null);

    if (!newWorkspaceId) {
      return;
    }

    setSwitchingWorkspace(true);
    try {
      await selectWorkspace(newWorkspaceId);
      const status = await yettiOnboardingAPI
        .getOnboardingStatus(newWorkspaceId)
        .catch((err: unknown) => {
          if (
            err instanceof Error &&
            (err.message.includes("404") ||
              err.message.toLowerCase().includes("not found"))
          ) {
            return null;
          }
          throw err;
        });

      if (!status || !status.is_onboarded) {
        const selectedWorkspace = workspaces.find(
          (workspace) => workspace.id === newWorkspaceId
        );
        setPendingWorkspace({
          id: newWorkspaceId,
          name: selectedWorkspace?.name,
        });
        setShowOnboardingModal(true);
      } else {
        setPendingWorkspace(null);
        setShowOnboardingModal(false);
      }
      previousWorkspaceIdRef.current = newWorkspaceId;
    } catch (err: any) {
      console.error("Failed to switch workspace", err);
      setWorkspaceSwitchError(
        err?.message || "Unable to switch workspace. Please try again."
      );
      setLocalWorkspaceSelection(previousWorkspaceId ?? "");
      previousWorkspaceIdRef.current = previousWorkspaceId ?? null;
    } finally {
      setSwitchingWorkspace(false);
    }
  };

  const handleOnboardingModalClose = () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
  };

  const handleOnboardingCompleted = async () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
    setWorkspaceSwitchError(null);
    try {
      await fetchWorkspaces();
    } catch (err) {
      console.error("Failed to refresh workspaces after onboarding", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm ${
          sidebarExpanded ? "w-72" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center px-6 border-b border-slate-100">
            <Link
              href="/"
              className={`flex items-center gap-2 transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              <div className="text-2xl font-extrabold tracking-tight">
                <span className="text-slate-900">YETTI</span>
                <span className="text-sky-500">.AI</span>
              </div>
            </Link>
            {!sidebarExpanded && (
               <div className="mx-auto text-xl font-extrabold tracking-tight text-sky-500">Y</div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
              { href: "/dashboard/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
              { href: "/dashboard/integrations", icon: Link2, label: "Integrations" },
              { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
              { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={buildLink(item.href)}
                  className={`group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                    active
                      ? "bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                    } ${sidebarExpanded ? "mr-3" : "mx-auto"}`}
                  />
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      sidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && sidebarExpanded && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-sky-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <div className={`flex items-center gap-3 ${!sidebarExpanded && "justify-center"}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-sky-200">
                {(user?.user_metadata?.first_name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U") as string}
              </div>
              <div
                className={`min-w-0 transition-all duration-300 ${
                  sidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email?.split('@')[0]}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              {sidebarExpanded && (
                 <button
                  onClick={handleSignOut}
                  className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:text-sky-600 hover:border-sky-200 transition-all"
        >
            {sidebarExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "pl-72" : "pl-20"
        }`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-xl transition-all">
          <div className="flex items-center gap-4">
            {/* Workspace Switcher */}
            <div className="relative group">
              <select
                id="dashboard-header-workspace-select"
                value={localWorkspaceSelection}
                onChange={handleWorkspaceChange}
                disabled={
                  switchingWorkspace ||
                  workspaceLoading ||
                  workspaces.length === 0
                }
                className="appearance-none rounded-xl border-2 border-slate-100 bg-white py-2.5 pl-4 pr-10 text-base font-bold text-slate-900  transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 min-w-[220px]"
                aria-label="Select workspace"
              >
                {workspaces.length === 0 ? (
                  <option value="">
                    {workspaceLoading
                      ? "Loading workspaces..."
                      : "No workspaces available"}
                  </option>
                ) : (
                  workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name || "Untitled workspace"}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-500 transition-colors">
                 {(switchingWorkspace || workspaceLoading) ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                 ) : (
                    <ChevronRight className="h-5 w-5 rotate-90" />
                 )}
              </div>
            </div>
            
            {(workspaceSwitchError || workspaceError) && (
              <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">
                {workspaceSwitchError || workspaceError}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Credits Button */}
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-sky-100 hover:border-sky-300 hover:shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              <span>100 Credits</span>
            </Link>

            <div className="h-8 w-px bg-slate-200" />

            {/* Discord Icon */}
            <Link
              href="https://discord.gg/hN8r5Tep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5865F2] text-white transition-all hover:bg-[#4752C4] hover:shadow-lg hover:scale-105"
              title="Join our Discord"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </Link>

            <div className="h-8 w-px bg-slate-200" />

            <button
              className="relative rounded-xl p-2.5 text-slate-500 transition-all hover:bg-sky-50 hover:text-sky-600"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 animate-fade-in-up">{children}</main>
        
        <WorkspaceOnboardingModal
          isOpen={showOnboardingModal}
          workspaceId={pendingWorkspace?.id ?? null}
          workspaceName={pendingWorkspace?.name}
          onClose={handleOnboardingModalClose}
          onCompleted={handleOnboardingCompleted}
        />
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
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>}>
      <WorkspaceSelector />
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}

