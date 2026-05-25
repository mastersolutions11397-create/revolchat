"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Bot, Loader2, LogIn, Plus, SendHorizontal, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/types/chat";

type EmbedBot = {
  id: string;
  name: string;
  profile_picture_url: string | null;
};

type EmbedResponse = {
  bot: EmbedBot;
  session: unknown | null;
  messages: ChatMessage[];
};

type EmbedAuthMessage = {
  type: "yetti:embed-auth";
  access_token: string;
  refresh_token: string;
};

function authHeaders(accessToken?: string | null): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export default function EmbedChatPage() {
  const params = useParams<{ botId: string }>();
  const botId = params.botId;
  const [bot, setBot] = useState<EmbedBot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  const title = useMemo(() => bot?.name ?? "Yetti Chat", [bot?.name]);

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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !signedIn) return;
    setInput("");
    setSending(true);
    setError(null);

    const optimistic = {
      id: `local-${Date.now()}`,
      session_id: "",
      workspace_id: "",
      message_text: text,
      message_type: "text" as const,
      sender_type: "user" as const,
      sender_id: "",
      sender_name: "You",
      is_read: false,
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const response = await fetch(`/api/embed/${encodeURIComponent(botId)}`, {
        method: "POST",
        headers: authHeaders(accessTokenRef.current),
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json()) as { messages?: ChatMessage[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimistic.id),
        ...(data.messages ?? []),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0f11] p-0 text-white">
      <section className="mx-auto flex min-h-screen max-w-2xl flex-col overflow-hidden bg-[#111417] sm:min-h-[720px] sm:rounded-2xl sm:border sm:border-white/10">
        <header className="border-b border-white/10 bg-[#0f1214] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-normal text-white">
                  Yetti <span className="text-amber-400">AI</span>
                </p>
                <p className="truncate text-xs font-medium text-zinc-400">{title} web chat</p>
              </div>
            </div>
            <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Live
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#191d21] p-3 ring-1 ring-white/10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-800 text-amber-400">
              {bot?.profile_picture_url ? (
                <Image
                  src={bot.profile_picture_url}
                  alt={title}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Bot className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white">{title}</h1>
              <p className="line-clamp-2 text-sm leading-snug text-zinc-400">
                Ask questions, get help, and continue your conversation here.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center bg-[#15191d] text-zinc-500">
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
          </div>
        ) : !signedIn ? (
          <div className="flex flex-1 items-center justify-center bg-[#15191d] px-6">
            <div className="w-full max-w-sm rounded-2xl bg-[#1a1e22] p-5 text-center ring-1 ring-white/10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Sign in to chat</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Sign in with Google so this bot can keep your conversation separate.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authenticating}
                className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authenticating ? "Opening Google..." : "Continue with Google"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#15191d] px-4 py-5">
              <div className="mx-auto w-fit rounded-full bg-[#2a2f36] px-3 py-1 text-xs font-bold text-white">
                Today
              </div>
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-[#1c2126] p-4 text-sm leading-relaxed text-zinc-400 ring-1 ring-white/10">
                  Send a message to start your conversation with {title}.
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.sender_type === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "bg-amber-400 text-zinc-950"
                            : "bg-[#22272d] text-zinc-100 ring-1 ring-white/10"
                        }`}
                      >
                        {message.message_text}
                      </div>
                    </div>
                  );
                })
              )}
              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[#22272d] px-4 py-3 text-sm text-zinc-400 ring-1 ring-white/10">
                    Typing...
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <form
              className="flex items-center gap-2 border-t border-white/10 bg-[#101316] p-3"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-amber-400"
                aria-label="Add attachment"
              >
                <Plus className="h-5 w-5" />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Message ${title}`}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1b2025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
