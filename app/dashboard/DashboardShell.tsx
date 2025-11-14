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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-md border-r border-gray-200 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
            <Link
              href="/"
              className={`text-xl font-extrabold tracking-tight text-gray-900 transition-opacity duration-300 ${
                sidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              YETTI<span className="text-gray-400">.AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-2 py-6">
            <Link
              href={buildLink("/dashboard")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <LayoutDashboard
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Dashboard
              </span>
            </Link>
            <Link
              href={buildLink("/dashboard/knowledge-base")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard/knowledge-base")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <BookOpen
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Knowledge Base
              </span>
            </Link>
            <Link
              href={buildLink("/dashboard/integrations")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard/integrations")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <Link2
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Integrations
              </span>
            </Link>
            <Link
              href={buildLink("/dashboard/billing")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard/billing")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <CreditCard
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Billing
              </span>
            </Link>
            <Link
              href={buildLink("/dashboard/settings")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard/settings")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <Settings
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Settings
              </span>
            </Link>
            <Link
              href={buildLink("/dashboard/workspace-hours")}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive("/dashboard/workspace-hours")
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <CalendarClock
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "mr-3" : "mx-auto"
                }`}
              />
              <span
                className={`text-sm font-medium transition-all duration-200 ${
                  sidebarExpanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                Workspace Hours
              </span>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {(user?.user_metadata?.first_name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U") as string}
              </div>
              <div
                className={`min-w-0 transition-all duration-200 ${
                  sidebarExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
                } overflow-hidden`}
              >
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className={`mt-3 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 ${
                sidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "pl-64" : "pl-20"
        }`}
      >
        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  id="dashboard-header-workspace-select"
                  value={localWorkspaceSelection}
                  onChange={handleWorkspaceChange}
                  disabled={
                    switchingWorkspace ||
                    workspaceLoading ||
                    workspaces.length === 0
                  }
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                {(switchingWorkspace || workspaceLoading) && (
                  <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>
              <button
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <Link
                href="/profile"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Profile"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
            {(workspaceSwitchError || workspaceError) && (
              <p className="text-xs text-red-500">
                {workspaceSwitchError || workspaceError}
              </p>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 transition-all duration-300">{children}</main>
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
    <Suspense fallback={<div>Loading...</div>}>
      <WorkspaceSelector />
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}

