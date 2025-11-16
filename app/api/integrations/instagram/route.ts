import { NextRequest, NextResponse } from "next/server";

const INSTAGRAM_LOGIN_ENDPOINT = "https://api.yetti.ai/instagram/login";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace_id");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspace_id query parameter is required" },
      { status: 400 },
    );
  }

  const redirectUrl = new URL(INSTAGRAM_LOGIN_ENDPOINT);
  redirectUrl.searchParams.set("workspace_id", workspaceId);

  return NextResponse.redirect(redirectUrl.toString(), {
    status: 302,
  });
}
