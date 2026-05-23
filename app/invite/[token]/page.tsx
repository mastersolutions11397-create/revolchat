"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { workspacesAPI } from "@/lib/api/workspaces";
import { useWorkspace } from "@/lib/workspace-context";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { refreshWorkspaces, setActiveWorkspaceId } = useWorkspace();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  const acceptInvite = async () => {
    setAccepting(true);
    setError("");
    try {
      const result = await workspacesAPI.acceptInvite(params.token);
      await refreshWorkspaces();
      setActiveWorkspaceId(result.workspace_id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d6159] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Workspace invitation</h1>
        <p className="mt-2 text-sm text-slate-500">Accept this invitation to join the workspace.</p>
        {error && <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Checking your session...</p>
        ) : user ? (
          <button onClick={acceptInvite} disabled={accepting} className="mt-6 w-full rounded-xl bg-teal-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {accepting ? "Accepting..." : "Accept invitation"}
          </button>
        ) : (
          <Link href={`/auth/login?redirect=${encodeURIComponent(`/invite/${params.token}`)}`} className="mt-6 block w-full rounded-xl bg-teal-primary px-4 py-3 text-center text-sm font-bold text-white">
            Sign in to accept
          </Link>
        )}
      </div>
    </div>
  );
}
