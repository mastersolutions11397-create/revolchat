"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Bot, Loader2, LogIn, SendHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
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

  const title = useMemo(() => bot?.name ?? "Yetti Chat", [bot?.name]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) setSignedIn(Boolean(session));

        const response = await fetch(`/api/embed/${encodeURIComponent(botId)}`, {
          headers: await authHeaders(),
        });
        const data = (await response.json()) as EmbedResponse | { error?: string };
        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Failed to load chat");
        }
        if (!("bot" in data)) {
          throw new Error("Failed to load chat");
        }
        if (!cancelled) {
          setBot(data.bot);
          setMessages(data.messages ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chat");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [botId]);

  useEffect(() => {
    async function handleEmbedAuth(event: MessageEvent<EmbedAuthMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "yetti:embed-auth") return;

      setAuthenticating(true);
      setError(null);
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: event.data.access_token,
        refresh_token: event.data.refresh_token,
      });
      if (sessionError) {
        setError(sessionError.message);
      }
      setAuthenticating(false);
    }

    window.addEventListener("message", handleEmbedAuth);
    return () => window.removeEventListener("message", handleEmbedAuth);
  }, []);

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
        headers: await authHeaders(),
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
    <main className="min-h-screen bg-slate-100 p-0 sm:p-6">
      <section className="mx-auto flex min-h-screen max-w-2xl flex-col overflow-hidden bg-white shadow-sm sm:min-h-[720px] sm:rounded-2xl sm:border sm:border-slate-200">
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-teal-primary/10 text-teal-primary">
            {bot?.profile_picture_url ? (
              <Image
                src={bot.profile_picture_url}
                alt={title}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-950">{title}</h1>
            <p className="text-xs text-slate-500">Web chat</p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !signedIn ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <LogIn className="h-6 w-6 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-950">Sign in to chat</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in with Google so this bot can keep your conversation separate.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authenticating}
                className="mt-5 w-full rounded-xl bg-teal-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-primary/90"
              >
                {authenticating ? "Opening Google..." : "Continue with Google"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                  Send a message to start your conversation.
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
                        className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          isUser
                            ? "bg-teal-primary text-white"
                            : "bg-white text-slate-800 shadow-sm"
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
                  <div className="rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                    Typing...
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form
              className="flex gap-2 border-t border-slate-200 bg-white p-3"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/15"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-primary text-white transition hover:bg-teal-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
