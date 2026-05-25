"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Bot,
  Camera,
  ChevronLeft,
  Crown,
  Heart,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  LogIn,
  MessageCircle,
  Plus,
  RotateCcw,
  SendHorizontal,
  Share2,
  Sparkles,
  UserCircle,
  Users,
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
      <section className="grid h-full w-full grid-cols-1 overflow-hidden bg-[#0d0f11] lg:grid-cols-[236px_minmax(360px,1fr)] xl:grid-cols-[250px_minmax(460px,1fr)_300px] 2xl:grid-cols-[280px_minmax(520px,1fr)_340px]">
        <aside className="hidden min-h-0 border-r border-white/10 bg-[#0f1214] px-4 py-5 lg:flex lg:flex-col">
          <div className="mb-7 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black tracking-normal text-white">
              Yetti <span className="text-amber-400">AI</span>
            </p>
          </div>

          <nav className="space-y-2 text-sm font-bold text-zinc-400">
            {[
              { icon: LayoutDashboard, label: "Explore" },
              { icon: Users, label: "AI Chat" },
              { icon: MessageCircle, label: "Chats", active: true },
              { icon: Bot, label: "AI Agents" },
              { icon: Camera, label: "Generate Photo" },
              { icon: ImageIcon, label: "Gallery" },
              { icon: UserCircle, label: "Manage Account" },
              { icon: HelpCircle, label: "Support" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    item.active
                      ? "bg-white/7 text-amber-400"
                      : "text-zinc-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-amber-400 bg-amber-400/5 p-4">
              <div className="flex items-center gap-3 text-sm font-bold text-white">
                <UserCircle className="h-5 w-5 text-amber-400" />
                Create Unique Digital Persona
              </div>
            </div>
            <div className="rounded-2xl border border-amber-400 bg-[#201b13] p-4">
              <div className="mb-3 flex items-center gap-2 text-xl font-black">
                Join <Crown className="h-5 w-5 text-amber-400" /> Premium
              </div>
              <div className="space-y-2 text-xs font-semibold text-zinc-200">
                <p>Unlock unlimited messages</p>
                <p>Priority AI responses</p>
                <p>Custom AI characters</p>
              </div>
              <button className="mt-4 w-full rounded-xl bg-gradient-to-b from-white to-amber-300 px-4 py-2 text-sm font-black text-zinc-950">
                Subscribe
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col bg-[#0d0f11] px-3 py-3 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-[#20242a] px-4 py-3 text-sm font-black text-white">
              <ChevronLeft className="h-5 w-5" />
              All Chats
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="rounded-xl bg-[#20242a] px-3 py-2 text-sm font-black">
                Yetti <span className="text-amber-400">AI</span>
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
                    className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {authenticating ? "Opening Google..." : "Continue with Google"}
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
          <div className="mb-4 flex items-center justify-end gap-3">
            <button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-zinc-950">
              Sign Up / Sign In
            </button>
            <div className="flex items-center gap-2 rounded-xl bg-[#191d21] px-3 py-2 font-black">
              <Heart className="h-4 w-4 fill-amber-400 text-amber-400" />
              120
            </div>
          </div>

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
              Your Yetti AI assistant is ready to answer questions and guide visitors through the conversation.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-400 px-3 py-3 text-sm font-black text-amber-300">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#20242a] px-3 py-3 text-sm font-black text-white">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#191d21] p-2 ring-1 ring-white/10">
            <button className="rounded-xl border border-amber-400 px-3 py-2 text-sm font-black text-white">
              Details
            </button>
            <button className="rounded-xl px-3 py-2 text-sm font-black text-zinc-300">
              Profile
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="aspect-[0.82] overflow-hidden rounded-xl bg-[#242930] ring-1 ring-white/10"
              >
                <div className="flex h-full items-end bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 p-2">
                  <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-zinc-200">
                    Yetti AI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
