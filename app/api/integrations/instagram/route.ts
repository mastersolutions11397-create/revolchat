import { NextRequest, NextResponse } from "next/server";

const INSTAGRAM_LOGIN_ENDPOINT = "https://api.yetti.ai/instagram/login";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace_id");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspace_id query parameter is required" },
      { status: 400 }
    );
  }

  const response = NextResponse.redirect(INSTAGRAM_LOGIN_ENDPOINT, {
    status: 302,
  });

  response.cookies.set({
    name: "workspace_id",
    value: workspaceId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}

