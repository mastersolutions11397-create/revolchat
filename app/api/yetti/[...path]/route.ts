import { NextRequest, NextResponse } from "next/server";
import { authenticate, getWorkspaceIdForUser } from "../helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Proxy requests to external yetti API with workspace resolved server-side (no workspace in client). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

async function proxyRequest(
  request: NextRequest,
  { path }: { path: string[] }
) {
  try {
    const user = await authenticate(request);
    const workspaceId = await getWorkspaceIdForUser(user.id);

    if (!workspaceId) {
      const pathStr = path.join("/");
      if (pathStr === "dashboard") {
        return NextResponse.json({
          user_profile: {},
          workspace_summary: {
            total_workspaces: 0,
            active_workspaces: 0,
            total_agents: 0,
            active_agents: 0,
            total_integrations: 0,
            active_integrations: 0,
          },
          recent_activity: [],
          quick_stats: {
            today_interactions: 0,
            this_week_interactions: 0,
            this_month_interactions: 0,
            avg_response_time: 0,
          },
        });
      }
      return NextResponse.json(
        { message: "No workspace" },
        { status: 404 }
      );
    }

    const pathStr = path.join("/");
    const url = `${API_BASE_URL}/api/yetti/workspaces/${workspaceId}/${pathStr}`;
    const authHeader = request.headers.get("authorization");

    const headers: HeadersInit = {
      "Content-Type": request.headers.get("content-type") || "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    };

    const body = request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

    const res = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    const text = await res.text();
    if (!res.ok) {
      try {
        const data = JSON.parse(text);
        return NextResponse.json(data, { status: res.status });
      } catch {
        return NextResponse.json({ message: text || res.statusText }, { status: res.status });
      }
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy request failed";
    const status = error && typeof (error as { status?: number }).status === "number"
      ? (error as { status: number }).status
      : 500;
    return NextResponse.json({ message }, { status });
  }
}
