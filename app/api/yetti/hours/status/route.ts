import { NextRequest, NextResponse } from "next/server";
import { authenticate, getWorkspaceIdForUser } from "../../helpers";
import {
  ApiError,
  fetchWorkspaceHours,
  serializeRow,
} from "@/app/api/yetti/workspaces/[workspaceId]/hours/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const workspaceId = await getWorkspaceIdForUser(user.id);

    if (!workspaceId) {
      return NextResponse.json(
        { message: "No workspace" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      throw new ApiError("Request body must be a JSON object", 400);
    }

    const workspaceOnline = (body as Record<string, unknown>).workspace_online;
    if (typeof workspaceOnline !== "boolean") {
      throw new ApiError("workspace_online must be a boolean", 422);
    }

    const existing = await fetchWorkspaceHours(workspaceId);

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("yetti_workspace_hours")
        .update({ workspace_online: workspaceOnline })
        .eq("workspace_id", workspaceId)
        .select()
        .maybeSingle();

      if (error || !data) {
        throw new ApiError("Failed to update workspace status");
      }
      return NextResponse.json(serializeRow(data));
    }

    const payload = {
      workspace_id: workspaceId,
      timezone: "UTC",
      schedule: {},
      respect_schedule: true,
      workspace_online: workspaceOnline,
    };

    const { data, error } = await supabaseAdmin
      .from("yetti_workspace_hours")
      .insert(payload)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new ApiError("Failed to create workspace hours record");
    }
    return NextResponse.json(serializeRow(data));
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Hours status PATCH failed", error);
    return NextResponse.json(
      { message: "Failed to update workspace status" },
      { status: 500 }
    );
  }
}
