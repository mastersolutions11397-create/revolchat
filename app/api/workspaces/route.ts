import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonError } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type WorkspaceRow = {
  id: string;
  name: string;
  owner_id?: string | null;
  user_id?: string | null;
  is_active?: boolean | null;
  created_at: string;
};

type MembershipWithWorkspace = {
  role: string;
  workspaces: WorkspaceRow | WorkspaceRow[] | null;
};

function serializeWorkspace(row: WorkspaceRow, role: string) {
  return {
    id: row.id,
    name: row.name,
    owner_id: row.owner_id ?? row.user_id,
    role,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
  };
}

const DEFAULT_CHATBOT_PROMPT =
  "You are a helpful support assistant for this workspace. Answer clearly and escalate when you do not have enough context.";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { data: memberships, error } = await supabaseAdmin
      .from("yetti_workspace_members")
      .select("role, workspaces(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      workspaces: ((memberships ?? []) as MembershipWithWorkspace[])
        .map((item) => {
          const workspace = Array.isArray(item.workspaces)
            ? item.workspaces[0]
            : item.workspaces;
          return workspace ? serializeWorkspace(workspace, item.role) : null;
        })
        .filter(Boolean),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json(
        { error: "Workspace name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const { data: workspace, error } = await supabaseAdmin
      .from("workspaces")
      .insert({
        name,
        owner_id: user.id,
        user_id: user.id,
        workspace_type: "team",
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;

    const { error: memberError } = await supabaseAdmin
      .from("yetti_workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        email: user.email,
        role: "owner",
        allowed_bot_ids: [],
      });
    if (memberError) throw memberError;

    const { error: botError } = await supabaseAdmin.from("agents").insert({
      name: `${name} Chatbot`,
      model: "openai",
      model_id: "gpt-4o-mini",
      system_prompt: DEFAULT_CHATBOT_PROMPT,
      api_key: process.env.DEFAULT_CHATBOT_API_KEY || process.env.OPENAI_API_KEY || "",
      telegram_bot_token: null,
      telegram_username: null,
      telegram_first_name: null,
      profile_picture_url: null,
      user_id: user.id,
      workspace_id: workspace.id,
    });
    if (botError) throw botError;

    return NextResponse.json(
      { workspace: serializeWorkspace(workspace, "owner") },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
