"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  Clock3,
  File,
  Loader2,
  LogIn,
  Paperclip,
  SendHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Attachment, ChatMessage, MessageType } from "@/lib/types/chat";

type EmbedBot = {
  id: string;
  name: string;
  profile_picture_url: string | null;
};

type EmbedResponse = {
  bot: EmbedBot;
  visitor: {
    name: string;
    email: string | null;
    avatarUrl: string | null;
  } | null;
  session: unknown | null;
  messages: ChatMessage[];
};

type EmbedAuthMessage = {
  type: "yetti:embed-auth";
  access_token: string;
  refresh_token: string;
};

type UploadResponse = {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  message_type: MessageType;
};

const MAX_MEDIA_SIZE_MB = 20;
const MAX_DOCUMENT_SIZE_MB = 5;

function authHeaders(accessToken?: string | null): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "Website visitor").trim();
  const words = source.includes("@")
    ? [source.split("@")[0]]
    : source.split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "WV";
}

function getMessageTypeFromFile(file: globalThis.File): MessageType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function renderMessageContent(message: ChatMessage) {
  const attachment = message.attachments?.[0];

  if (message.message_type === "image" && attachment?.url) {
    return (
      <div className="space-y-2">
        {attachment.url.startsWith("blob:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.url}
            alt={attachment.filename || "Sent image"}
            className="aspect-[4/3] w-full max-w-[min(16rem,70vw)] rounded-xl bg-slate-100 object-cover"
          />
        ) : (
          <div className="relative aspect-[4/3] w-full max-w-[min(16rem,70vw)] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={attachment.url}
              alt={attachment.filename || "Sent image"}
              fill
              className="object-cover"
            />
          </div>
        )}
        {message.message_text ? <p>{message.message_text}</p> : null}
      </div>
    );
  }

  if (message.message_type === "video" && attachment?.url) {
    return (
      <div className="space-y-2">
        <video
          src={attachment.url}
          controls
          className="max-h-56 w-full max-w-[min(16rem,70vw)] rounded-xl bg-black"
        />
        {message.message_text ? <p>{message.message_text}</p> : null}
      </div>
    );
  }

  if ((message.message_type === "audio" || message.message_type === "file") && attachment?.url) {
    return (
      <div className="space-y-2">
        {message.message_type === "audio" ? (
          <audio src={attachment.url} controls className="w-full max-w-[min(16rem,70vw)]" />
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-lg bg-black/5 px-3 py-2 underline-offset-2 hover:underline"
          >
            <File className="h-4 w-4" />
            <span className="truncate">{attachment.filename || "Open file"}</span>
          </a>
        )}
        {message.message_text ? <p>{message.message_text}</p> : null}
      </div>
    );
  }

  return <>{message.message_text}</>;
}

export default function EmbedChatPage() {
  const params = useParams<{ botId: string }>();
  const botId = params.botId;
  const [bot, setBot] = useState<EmbedBot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: globalThis.File;
    type: MessageType;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [visitor, setVisitor] = useState<EmbedResponse["visitor"]>(null);
  const [error, setError] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => bot?.name ?? "AI Assistant", [bot?.name]);

  const loadChat = useCallback(async (accessToken?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const token = accessToken ?? accessTokenRef.current;
      setSignedIn(Boolean(token));

      const response = await fetch(`/api/embed/${encodeURIComponent(botId)}`, {
        headers: authHeaders(token),
      });
      const data = (await response.json()) as EmbedResponse | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to load chat");
      }
      if (!("bot" in data)) {
        throw new Error("Failed to load chat");
      }
      setBot(data.bot);
      setVisitor(data.visitor ?? null);
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    async function handleEmbedAuth(event: MessageEvent<EmbedAuthMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "yetti:embed-auth") return;

      setAuthenticating(true);
      setError(null);
      accessTokenRef.current = event.data.access_token;
      setSignedIn(true);
      await loadChat(event.data.access_token);
      setAuthenticating(false);
    }

    window.addEventListener("message", handleEmbedAuth);
    return () => window.removeEventListener("message", handleEmbedAuth);
  }, [loadChat]);

  const signInWithGoogle = async () => {
    setAuthenticating(true);
    setError(null);

    if (typeof window === "undefined") {
      setAuthenticating(false);
      return;
    }

    const popup = window.open(
      `/auth/embed-login?botId=${encodeURIComponent(botId)}`,
      "yetti-google-auth",
      "width=520,height=720"
    );
    if (!popup) {
      setError("Please allow popups to sign in with Google.");
      setAuthenticating(false);
      return;
    }
    const popupCheck = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(popupCheck);
        setAuthenticating(false);
      }
    }, 500);
  };

  const uploadAttachment = async (file: globalThis.File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/embed/${encodeURIComponent(botId)}/upload`, {
      method: "POST",
      headers: accessTokenRef.current
        ? { Authorization: `Bearer ${accessTokenRef.current}` }
        : undefined,
      body: formData,
    });
    const data = (await response.json()) as UploadResponse | { error?: string };

    if (!response.ok) {
      throw new Error("error" in data ? data.error : "Failed to upload file");
    }

    return data as UploadResponse;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !pendingAttachment) || sending || !signedIn) return;
    setInput("");
    setSending(true);
    setError(null);

    const attachmentPreview: Attachment[] = pendingAttachment
      ? [
          {
            type: pendingAttachment.type,
            url: URL.createObjectURL(pendingAttachment.file),
            filename: pendingAttachment.file.name,
            size: pendingAttachment.file.size,
            mime_type: pendingAttachment.file.type,
          },
        ]
      : [];

    const optimistic = {
      id: `local-${Date.now()}`,
      session_id: "",
      workspace_id: "",
      message_text: text,
      message_type: pendingAttachment?.type ?? ("text" as const),
      sender_type: "user" as const,
      sender_id: "",
      sender_name: "You",
      is_read: false,
      attachments: attachmentPreview,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      let attachments: Attachment[] = [];
      let messageType: MessageType | undefined;

      if (pendingAttachment) {
        const uploadResult = await uploadAttachment(pendingAttachment.file);
        messageType = uploadResult.message_type;
        attachments = [
          {
            type: uploadResult.message_type,
            url: uploadResult.url,
            filename: uploadResult.filename,
            size: uploadResult.size,
            mime_type: uploadResult.mime_type,
          },
        ];
      }

      const response = await fetch(`/api/embed/${encodeURIComponent(botId)}`, {
        method: "POST",
        headers: authHeaders(accessTokenRef.current),
        body: JSON.stringify({ message: text, message_type: messageType, attachments }),
      });
      const data = (await response.json()) as { messages?: ChatMessage[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimistic.id),
        ...(data.messages ?? []),
      ]);
      setPendingAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleSelectAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextType = getMessageTypeFromFile(file);
    const maxSizeBytes =
      nextType === "file"
        ? MAX_DOCUMENT_SIZE_MB * 1024 * 1024
        : MAX_MEDIA_SIZE_MB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(
        nextType === "file"
          ? `Document size must be ${MAX_DOCUMENT_SIZE_MB} MB or less.`
          : `Media size must be ${MAX_MEDIA_SIZE_MB} MB or less.`
      );
      event.target.value = "";
      return;
    }

    setError(null);
    setPendingAttachment({ file, type: nextType });
  };

  const clearPendingAttachment = () => {
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="h-dvh w-screen overflow-hidden bg-[#f6f3ee] p-0 text-slate-950 sm:p-2">
      <section className="grid h-full min-h-0 w-full overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 sm:rounded-3xl lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_300px] 2xl:grid-cols-[310px_minmax(0,1fr)_330px]">
        <aside className="hidden min-h-0 border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:flex-col xl:px-5 xl:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-500">
              {bot?.profile_picture_url ? (
                <Image
                  src={bot.profile_picture_url}
                  alt={title}
                  width={36}
                  height={36}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <p className="truncate text-lg font-black tracking-normal text-slate-950 xl:text-2xl">
              {title}
            </p>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-3 xl:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-sm font-black text-amber-700">
                {getInitials(visitor?.name, visitor?.email)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  {visitor?.name ?? "Website visitor"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {signedIn ? "Signed in" : "Guest session"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col bg-white">
          <div className="flex min-h-16 items-center gap-3 border-b border-slate-100 px-3 py-3 sm:px-4 lg:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-amber-500">
              {bot?.profile_picture_url ? (
                <Image
                  src={bot.profile_picture_url}
                  alt={title}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{title}</p>
              <p className="text-xs text-emerald-600">Online</p>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.08),_transparent_32%),radial-gradient(circle_at_70%_20%,_rgba(236,72,153,0.08),_transparent_26%),#fffdfb]">
            {loading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
              </div>
            ) : !signedIn ? (
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl shadow-slate-200/60 sm:rounded-3xl sm:p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                    <LogIn className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-950">Sign in to chat</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Sign in with Google so this bot can keep your conversation separate.
                  </p>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={authenticating}
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                        Opening Google...
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
                  {messages.length === 0 ? (
                    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-2 text-center">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-sm font-black text-amber-600 sm:mb-5 sm:h-12 sm:w-12">
                        HI
                      </div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        Hi there! I am {title}.
                      </h1>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                        I am here to help you find answers and guide you through anything you need.
                      </p>
                    </div>
                  ) : (
                    <div className="mx-auto w-full max-w-3xl space-y-4">
                      <div className="mx-auto w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        Today
                      </div>
                      {messages.map((message) => {
                        const isUser = message.sender_type === "user";
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[88%] overflow-hidden rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[82%] sm:px-4 sm:py-3 ${
                                isUser
                                  ? "bg-slate-950 text-white"
                                  : "border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              {renderMessageContent(message)}
                            </div>
                          </div>
                        );
                      })}
                      {sending ? (
                        <div className="flex justify-start">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                            Typing...
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {error ? (
                  <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 sm:px-4">
                    {error}
                  </div>
                ) : null}

                <form
                  className="mx-auto w-full max-w-3xl px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                >
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 sm:rounded-3xl sm:p-4">
                    {pendingAttachment ? (
                      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <File className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {pendingAttachment.file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB
                              {pendingAttachment.type === "file"
                                ? ` / ${MAX_DOCUMENT_SIZE_MB} MB max`
                                : ` / ${MAX_MEDIA_SIZE_MB} MB max`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearPendingAttachment}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                          aria-label="Remove attachment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Ask me anything..."
                      className="h-11 w-full min-w-0 bg-transparent px-1 text-base text-slate-950 outline-none placeholder:text-slate-400 sm:h-12"
                    />
                    <div className="mt-3 flex items-center justify-between gap-2 sm:gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleSelectAttachment}
                        accept=".pdf,.doc,.docx,.txt,image/*,video/*,audio/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="hidden sm:inline">Attach file</span>
                      </button>
                      <button
                        type="submit"
                        disabled={sending || (!input.trim() && !pendingAttachment)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
                        aria-label="Send message"
                      >
                        {sending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <SendHorizontal className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {messages.length === 0 ? (
                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4">
                      {[
                        "Tell me about your services",
                        "How can I get started?",
                        "What makes you different?",
                      ].map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => setInput(example)}
                          className="max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-4 sm:py-3"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </form>
              </>
            )}
          </div>
        </div>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-4 py-5 xl:block 2xl:px-5 2xl:py-6">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <div className="relative aspect-[1.05] bg-gradient-to-br from-amber-100 via-pink-100 to-violet-100">
              {bot?.profile_picture_url ? (
                <Image
                  src={bot.profile_picture_url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-amber-500">
                  <Bot className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 2xl:mt-7">
            <h2 className="min-w-0 truncate text-xl font-black text-slate-950 2xl:text-2xl">{title}</h2>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 2xl:text-base">
            I am your AI assistant. Ask me anything or explore examples to get started.
          </p>

          <div className="mt-8 space-y-6 2xl:mt-10 2xl:space-y-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-950">Fast answers</p>
                <p className="mt-1 text-sm text-slate-500">Get replies in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-950">Private and secure</p>
                <p className="mt-1 text-sm text-slate-500">Your chat stays separate</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-950">Always here</p>
                <p className="mt-1 text-sm text-slate-500">Available whenever visitors need help</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
