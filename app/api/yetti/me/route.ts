import { NextRequest, NextResponse } from "next/server";
import { authenticate, getWorkspaceIdForUser } from "../helpers";

/** Returns the current user's resolved workspace id (for legacy/third-party APIs that still require it). */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const workspace_id = await getWorkspaceIdForUser(user.id);
    return NextResponse.json({ workspace_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = error && typeof (error as { status?: number }).status === "number"
      ? (error as { status: number }).status
      : 401;
    return NextResponse.json({ message }, { status });
  }
}
