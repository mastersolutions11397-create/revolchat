import { NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  authenticate,
  getWorkspaceIdForUser,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const workspaceId = await getWorkspaceIdForUser(user.id);

    // Get user profile from metadata
    const userProfile = {
      first_name: user.user_metadata?.first_name || user.email?.split("@")[0] || "User",
      last_name: user.user_metadata?.last_name || "",
      company: user.user_metadata?.company || "",
    };

    if (!workspaceId) {
      // Return default empty data if no workspace exists
      return NextResponse.json({
        user_profile: userProfile,
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

    // Fetch total agents count for this user
    const { count: totalAgents } = await supabaseAdmin
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Count active agents (agents with telegram_bot_token set)
    const { count: activeAgents } = await supabaseAdmin
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("telegram_bot_token", "is", null);

    // Get today's date boundaries in UTC
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Get week start (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekStartISO = weekStart.toISOString();

    // Get month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Count messages for different time periods
    const [todayMessages, weekMessages, monthMessages] = await Promise.all([
      // Today's messages
      supabaseAdmin
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("created_at", todayStart),

      // This week's messages
      supabaseAdmin
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("created_at", weekStartISO),

      // This month's messages
      supabaseAdmin
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("created_at", monthStart),
    ]);

    // Count active chat sessions (integrations)
    const { count: activeSessions } = await supabaseAdmin
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("session_status", "active");

    // Get recent activity (last 10 messages)
    const { data: recentMessages } = await supabaseAdmin
      .from("chat_messages")
      .select(`
        id,
        message_text,
        sender_type,
        sender_name,
        created_at,
        session_id,
        chat_sessions!inner(platform)
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentActivity = (recentMessages || []).map((msg) => {
      const sessions = msg.chat_sessions as unknown as { platform: string } | { platform: string }[] | null;
      const platform = Array.isArray(sessions) ? sessions[0]?.platform : sessions?.platform;
      return {
        type: msg.sender_type === "ai" ? "ai_response" : msg.sender_type === "admin" ? "admin_message" : "user_message",
        message: msg.message_text?.substring(0, 100) || "",
        platform: platform || "unknown",
        timestamp: msg.created_at,
      };
    });

    return NextResponse.json({
      user_profile: userProfile,
      workspace_summary: {
        total_workspaces: 1,
        active_workspaces: 1,
        total_agents: totalAgents || 0,
        active_agents: activeAgents || 0,
        total_integrations: activeSessions || 0,
        active_integrations: activeSessions || 0,
      },
      recent_activity: recentActivity,
      quick_stats: {
        today_interactions: todayMessages.count || 0,
        this_week_interactions: weekMessages.count || 0,
        this_month_interactions: monthMessages.count || 0,
        avg_response_time: 0, // Could be calculated if we track response times
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Dashboard GET failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
