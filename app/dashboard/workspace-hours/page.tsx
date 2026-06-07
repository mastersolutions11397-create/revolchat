"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WorkspaceHoursPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
      <p className="text-slate-600">
        Working hours are not available. Redirecting to dashboard…
      </p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-brand hover:underline"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
