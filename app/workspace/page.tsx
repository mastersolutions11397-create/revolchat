"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Workspace selection has been removed. Redirect to dashboard.
 */
export default function WorkspacePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-dashboard-bg">
      <p className="text-slate-500">Redirecting to dashboard...</p>
    </div>
  );
}
