import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError } from "@/lib/api-auth";
import type { MessageType } from "@/lib/types/chat";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const MAX_MEDIA_SIZE = 20 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function isStorageUnsupportedMimeTypeError(error: { statusCode?: string; status?: number; message?: string }) {
  return (
    error.statusCode === "415" ||
    error.status === 415 ||
    error.message?.toLowerCase().includes("mime type")
  );
}

function getMessageTypeFromMimeType(mimeType: string): MessageType {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  return "file";
}

function getMaxSizeForMessageType(messageType: MessageType): number {
  return messageType === "file" ? MAX_DOCUMENT_SIZE : MAX_MEDIA_SIZE;
}

function formatMaxSizeLabel(messageType: MessageType): string {
  return messageType === "file" ? "5MB" : "20MB";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const messageType = getMessageTypeFromMimeType(file.type);
    const maxSize = getMaxSizeForMessageType(messageType);

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${formatMaxSizeLabel(messageType)}.`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM, MP3, WAV, OGG, PDF, DOC, DOCX, TXT",
        },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).slice(2, 8);
    const fileName = `chat-media/${user.id}/${timestamp}-${randomStr}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("trigger-media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Chat upload error:", error);

      if (isStorageUnsupportedMimeTypeError(error)) {
        return NextResponse.json(
          {
            error:
              "This file type is not enabled in Supabase Storage. Update the trigger-media bucket MIME allowlist and try again.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("trigger-media")
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename: file.name,
      size: file.size,
      mime_type: file.type,
      message_type: messageType,
      path: data.path,
    });
  } catch (error) {
    console.error("Error in chat upload:", error);
    return jsonError(error);
  }
}
