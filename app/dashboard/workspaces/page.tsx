"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Mail, Save, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-context";
import { workspacesAPI, type WorkspaceInvitation, type WorkspaceMember, type WorkspaceRole } from "@/lib/api/workspaces";
import { agentsAPI, type Agent } from "@/lib/api/agents";

export default function WorkspacesPage() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [bots, setBots] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [inviteUrl, setInviteUrl] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const canManage = activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";
  const isOwner = activeWorkspace?.role === "owner";

  const loadData = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      setWorkspaceName(activeWorkspace.name);
      const [memberData, botData] = await Promise.all([
        canManage
          ? workspacesAPI.members(activeWorkspace.id)
          : Promise.resolve({ members: [], invitations: [] }),
        agentsAPI.list(activeWorkspace.id),
      ]);
      setMembers(memberData.members);
      setInvitations(memberData.invitations);
      setBots(botData.agents);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, canManage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const botNameById = useMemo(
    () => new Map(bots.map((bot) => [bot.id, bot.name])),
    [bots]
  );

  const toggleBot = (id: string) => {
    setSelectedBotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const inviteMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeWorkspace) return;
    try {
      const result = await workspacesAPI.invite(activeWorkspace.id, {
        email,
        role,
        allowed_bot_ids: role === "admin" ? [] : selectedBotIds,
      });
      setInviteUrl(result.invite_url);
      setEmail("");
      setSelectedBotIds([]);
      await loadData();
      toast.success("Invitation created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite member");
    }
  };

  const saveWorkspaceName = async () => {
    if (!activeWorkspace) return;
    try {
      await workspacesAPI.update(activeWorkspace.id, workspaceName);
      await refreshWorkspaces();
      toast.success("Workspace updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update workspace");
    }
  };

  const updateMember = async (member: WorkspaceMember, next: Partial<WorkspaceMember>) => {
    if (!activeWorkspace) return;
    try {
      await workspacesAPI.updateMember(activeWorkspace.id, member.id, {
        role: (next.role ?? member.role) as WorkspaceRole,
        allowed_bot_ids: next.allowed_bot_ids ?? member.allowed_bot_ids,
      });
      await loadData();
      toast.success("Member updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    }
  };

  const removeMember = async (member: WorkspaceMember) => {
    if (!activeWorkspace) return;
    try {
      await workspacesAPI.removeMember(activeWorkspace.id, member.id);
      await loadData();
      toast.success("Member removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  if (!activeWorkspace) {
    return <div className="rounded-2xl border border-dashboard-border bg-white p-8 text-slate-600">Create a workspace to manage members.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Users className="h-7 w-7 text-teal-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Workspaces</h1>
            <p className="text-sm text-white/75">Manage workspace members and bot access.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-dashboard-border bg-white p-12">
          <Loader2 className="h-7 w-7 animate-spin text-teal-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Workspace details</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                disabled={!canManage}
                className="flex-1 rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary"
              />
              {canManage && (
                <button onClick={saveWorkspaceName} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-primary px-5 py-3 text-sm font-bold text-white">
                  <Save className="h-4 w-4" />
                  Save
                </button>
              )}
            </div>
          </div>

          {canManage && (
            <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Invite member</h2>
              <form onSubmit={inviteMember} className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                  <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@example.com" className="rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary" />
                  <select value={role} onChange={(event) => setRole(event.target.value as WorkspaceRole)} className="rounded-xl border border-dashboard-border bg-dashboard-bg px-4 py-3 text-sm outline-none focus:border-teal-primary">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {role === "member" && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Bots this member can manage</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {bots.map((bot) => (
                        <label key={bot.id} className="flex items-center gap-2 rounded-xl border border-dashboard-border px-3 py-2 text-sm">
                          <input type="checkbox" checked={selectedBotIds.includes(bot.id)} onChange={() => toggleBot(bot.id)} />
                          <span className="truncate">{bot.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <button className="inline-flex items-center gap-2 rounded-xl bg-teal-primary px-5 py-3 text-sm font-bold text-white">
                  <Mail className="h-4 w-4" />
                  Create invite
                </button>
              </form>
              {inviteUrl && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success("Invite link copied");
                  }}
                  className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashboard-border bg-slate-50 px-4 py-3 text-left text-sm text-slate-700"
                >
                  <Copy className="h-4 w-4 shrink-0 text-teal-primary" />
                  <span className="truncate">{inviteUrl}</span>
                </button>
              )}
            </div>
          )}

          {canManage && (
            <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Members</h2>
              <div className="mt-4 space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="rounded-xl border border-dashboard-border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{member.email ?? member.user_id}</p>
                        <p className="text-xs uppercase text-slate-500">{member.role}</p>
                      </div>
                      {isOwner && member.role !== "owner" && (
                        <>
                          <select value={member.role} onChange={(event) => updateMember(member, { role: event.target.value as WorkspaceRole })} className="rounded-lg border border-dashboard-border px-3 py-2 text-sm">
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => removeMember(member)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {member.role === "member" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bots.map((bot) => {
                          const checked = member.allowed_bot_ids.includes(bot.id);
                          return (
                            <button
                              key={bot.id}
                              disabled={!isOwner}
                              onClick={() =>
                                updateMember(member, {
                                  allowed_bot_ids: checked
                                    ? member.allowed_bot_ids.filter((id) => id !== bot.id)
                                    : [...member.allowed_bot_ids, bot.id],
                                })
                              }
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${checked ? "bg-teal-primary/10 text-teal-primary" : "bg-slate-100 text-slate-500"}`}
                            >
                              {bot.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {invitations.length > 0 && (
            <div className="rounded-2xl border border-dashboard-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Pending invitations</h2>
              <div className="mt-4 space-y-2">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span>{invite.email}</span>
                    <span className="text-slate-500">
                      {invite.role}
                      {invite.allowed_bot_ids.length ? ` · ${invite.allowed_bot_ids.map((id) => botNameById.get(id) ?? "Bot").join(", ")}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
