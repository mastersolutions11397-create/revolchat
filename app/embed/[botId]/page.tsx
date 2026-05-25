"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  Loader2,
  LogIn,
  Plus,
  SendHorizontal,
  ShieldCheck,
} from "lucide-react";
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
    <main className="h-screen w-screen overflow-hidden bg-[#0d0f11] text-white">
      <section className="grid h-full w-full grid-cols-1 overflow-hidden bg-[#0d0f11] lg:grid-cols-[280px_minmax(420px,1fr)] xl:grid-cols-[300px_minmax(460px,1fr)_320px] 2xl:grid-cols-[320px_minmax(560px,1fr)_360px]">
        <aside className="hidden min-h-0 border-r border-white/10 bg-[#0f1214] px-5 py-5 lg:block">
          <div className="rounded-3xl bg-[#191d21] p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#242930] text-amber-400">
                {bot?.profile_picture_url ? (
                  <Image
                    src={bot.profile_picture_url}
                    alt={title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bot className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-white">{title}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online now
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Start a conversation and get an instant response from this assistant.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[#191d21] p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-black text-white">Fast replies</p>
                  <p className="text-xs text-zinc-500">Responses are generated in chat.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#191d21] p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-black text-white">Private session</p>
                  <p className="text-xs text-zinc-500">Google sign-in keeps chats separate.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-[#191d21] p-4 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Conversation tips
            </p>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p className="rounded-xl bg-[#22272e] px-3 py-2">Ask about products or services</p>
              <p className="rounded-xl bg-[#22272e] px-3 py-2">Request help with next steps</p>
              <p className="rounded-xl bg-[#22272e] px-3 py-2">Continue anytime after login</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col bg-[#0d0f11] px-3 py-3 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#20242a] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#30363f] text-amber-400">
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
                <p className="truncate text-sm font-black text-white">{title}</p>
                <p className="text-xs font-semibold text-emerald-400">Online</p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-[#191d21] ring-1 ring-white/5">
            {loading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center text-zinc-500">
                <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
              </div>
            ) : !signedIn ? (
              <div className="flex min-h-0 flex-1 items-center justify-center px-6">
                <div className="w-full max-w-sm rounded-2xl bg-[#20252b] p-5 text-center ring-1 ring-white/10">
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
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {authenticating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-700" />
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
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
                  <div className="mx-auto w-fit rounded-full bg-[#333842] px-3 py-1 text-xs font-black text-white">
                    Today
                  </div>
                  {messages.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-2xl bg-[#20252b] p-4 text-center text-sm leading-relaxed text-zinc-400 ring-1 ring-white/10">
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
                                : "bg-[#242930] text-zinc-100 ring-1 ring-white/10"
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
                      <div className="rounded-2xl bg-[#242930] px-4 py-3 text-sm text-zinc-400 ring-1 ring-white/10">
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
                  className="flex items-center gap-2 p-3"
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
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#20252b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
        </div>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-white/10 bg-[#0f1214] px-5 py-5 xl:block">
          <div className="overflow-hidden rounded-3xl bg-[#191d21] ring-1 ring-white/10">
            <div className="relative aspect-[1.15] bg-[#242930]">
              {bot?.profile_picture_url ? (
                <Image
                  src={bot.profile_picture_url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-amber-400">
                  <Bot className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              This assistant is ready to answer questions and guide visitors through the conversation.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
