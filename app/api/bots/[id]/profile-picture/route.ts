import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

async function syncProfileToTelegram(botToken: string, imageBuffer: Buffer): Promise<boolean> {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: "image/png" });
    formData.append("photo", blob, "profile.png");

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyPhoto`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return result.ok === true;
  } catch (err) {
    console.error("Failed to sync profile to Telegram:", err);
    return false;
  }
}

// POST /api/bots/[id]/profile-picture - Upload profile picture
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB allowed." },
        { status: 400 }
      );
    }

    // Get current bot to check for Telegram token
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const filename = `agent-profiles/${id}/${Date.now()}.${ext}`;

    // Try to upload to Supabase Storage
    let publicUrl: string;
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filename);
      publicUrl = urlData.publicUrl;
    } catch (storageErr) {
      // Fallback to base64 data URL
      console.error("Storage upload failed, using base64:", storageErr);
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Update bot with profile picture URL
    const { error: updateError } = await supabase
      .from("agents")
      .update({ profile_picture_url: publicUrl })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update bot" }, { status: 500 });
    }

    // Auto-sync to Telegram if token exists
    let telegramSynced = false;
    if (agent.telegram_bot_token) {
      telegramSynced = await syncProfileToTelegram(agent.telegram_bot_token, buffer);
    }

    return NextResponse.json({
      success: true,
      profile_picture_url: publicUrl,
      telegram_synced: telegramSynced,
    });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

// DELETE /api/bots/[id]/profile-picture - Remove profile picture
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Check if bot exists
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Remove profile picture URL
    const { error: updateError } = await supabase
      .from("agents")
      .update({ profile_picture_url: null })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update bot" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Profile picture removed" });
  } catch (err) {
    console.error("Error removing profile picture:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}
