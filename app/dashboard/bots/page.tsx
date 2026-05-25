"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, type AppUser } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { agentsAPI, type Agent, type AgentModel } from "@/lib/api/agents";
import { agentChatAPI } from "@/lib/api/agent-chat";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import {
  Bot,
  Plus,
  Trash2,
  X,
  Loader2,
  SendHorizontal,
  AlertCircle,
  FileText,
  Maximize2,
  Minimize2,
  Edit3,
  Send,
  Copy,
  Globe,
} from "lucide-react";
import BotWizard from "@/components/bot-wizard/BotWizard";
import { toast } from "sonner";
import { getAppUrl } from "@/lib/app-url";

export type BotRecord = {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  modelId: string | null;
  apiKey: string;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  profilePictureUrl: string | null;
};

const MODEL_PROVIDERS: AgentModel[] = ["openai", "deepseek", "gemini"];

const MODEL_IDS_BY_PROVIDER: Record<AgentModel, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
};

const MODEL_LABELS: Record<string, string> = {
  "deepseek-chat": "DeepSeek-V3.2 (Non-thinking Mode)",
  "deepseek-reasoner": "DeepSeek-V3.2 (Thinking Mode)",
};

function botFromAPI(a: Agent): BotRecord {
  return {
    id: a.id,
    name: a.name,
    systemPrompt: a.system_prompt,
    model: a.model,
    modelId: a.model_id ?? null,
    apiKey: a.api_key ?? "***",
    telegramUsername: a.telegram_username ?? null,
    telegramFirstName: a.telegram_first_name ?? null,
    profilePictureUrl: a.profile_picture_url ?? null,
  };
}

export default function BotsPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [bots, setBots] = useState<BotRecord[]>([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [botsError, setBotsError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [editingBot, setEditingBot] = useState<BotRecord | null>(null);
  const [embedBot, setEmbedBot] = useState<BotRecord | null>(null);

  const getEmbedUrl = useCallback((botId: string) => {
    return `${getAppUrl()}/embed/${botId}`;
  }, []);

  const fetchBots = useCallback(async () => {
    setBotsLoading(true);
    setBotsError(null);
    try {
      if (!activeWorkspace) {
        setBots([]);
        return;
      }
      const { agents: list } = await agentsAPI.list(activeWorkspace.id);
      setBots(list.map(botFromAPI));
    } catch (err) {
      setBotsError(err instanceof Error ? err.message : "Failed to load bots.");
      setBots([]);
    } finally {
      setBotsLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleDeleteBot = useCallback(async (id: string) => {
    toast.warning("Delete this bot?", {
      description: "This action cannot be undone.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await agentsAPI.delete(id);
            setBots((prev) => prev.filter((b) => b.id !== id));
            toast.success("Bot deleted");
          } catch (err) {
            console.error("Delete bot failed:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete bot.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Deletion cancelled");
        },
      },
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto lg:min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800 p-4 sm:p-6 md:p-8 text-white shadow-xl overflow-visible">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20 shrink-0">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-teal-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                Your Bots
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg text-white/80 max-w-xl">
                Create and manage AI bots connected to Telegram. Configure
                system prompts, models, and test them in real-time.
              </p>
            </div>
          </div>
          <div className="relative z-50 shrink-0">
            <button
              type="button"
              data-tour="add-bot-button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3 text-sm font-bold transition-all hover:bg-teal-primary/10 hover:text-teal-primary shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Create Bot
            </button>
          </div>
        </div>
      </div>

      {/* Bots list + Test Chat */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-start">
        <div className="flex min-h-[320px] h-[40vh] sm:h-[420px] xl:h-[522px] flex-1 flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card shadow-lg min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 border-b border-dashboard-border bg-gradient-to-br from-dashboard-bg via-teal-primary/5 to-dashboard-bg px-4 sm:px-6 py-3 sm:py-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-teal-primary" />
                Your Bots
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {bots.length === 0
                  ? "No bots yet"
                  : bots.length === 1
                    ? "1 bot"
                    : `${bots.length} bots`}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {botsLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-primary" />
                  <p className="text-sm">Loading bots...</p>
                </div>
              </div>
            ) : botsError ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Could not load bots
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{botsError}</p>
                  <button
                    type="button"
                    onClick={() => fetchBots()}
                    className="mt-3 text-sm font-medium text-teal-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : bots.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    No bots yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Click &quot;Create Bot&quot; to get started.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-start gap-4 rounded-xl border border-dashboard-border bg-white p-4 shadow-sm hover:border-teal-primary/30 transition-colors"
                  >
                    {/* Profile picture */}
                    <div className="h-12 w-12 rounded-full bg-teal-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {bot.profilePictureUrl ? (
                        <Image
                          src={bot.profilePictureUrl}
                          alt={bot.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Bot className="h-6 w-6 text-teal-primary" />
                      )}
                    </div>

                    {/* Bot info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {bot.name}
                        </p>
                        {bot.telegramUsername && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#0088cc]/10 text-[#0088cc]">
                            <Send className="h-3 w-3" />@{bot.telegramUsername}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {MODEL_LABELS[bot.modelId ?? ""] ??
                          bot.modelId ??
                          bot.model}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {bot.systemPrompt.slice(0, 80)}
                        {bot.systemPrompt.length > 80 ? "..." : ""}
                      </p>
                      <div className="mt-2 flex min-w-0 items-center gap-2 rounded-lg border border-teal-primary/15 bg-teal-primary/5 px-2 py-1.5 text-xs text-slate-600">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0 text-teal-primary" />
                        <span className="font-medium text-teal-primary">Web Embed</span>
                        <span className="min-w-0 flex-1 truncate text-slate-500">
                          {getEmbedUrl(bot.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmbedBot(bot)}
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-teal-primary transition hover:bg-white"
                          title="Get embed code"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Code
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingBot(bot)}
                        className="p-2 text-slate-400 hover:text-teal-primary hover:bg-teal-primary/10 rounded-lg transition-colors"
                        title="Edit bot"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBot(bot.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete bot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={
            chatExpanded
              ? "fixed inset-4 z-50 min-h-0 flex flex-col rounded-2xl shadow-2xl ring-2 ring-slate-200/50 bg-white"
              : "min-h-[320px] h-[40vh] sm:h-[420px] xl:h-[520px] xl:w-[360px] xl:flex-shrink-0 min-w-0"
          }
        >
          <ChatPanel
            bots={bots}
            user={user}
            emptyStateMessage="Create a bot to start testing."
            noItemsMessage="No bots yet"
            useAddToStartMessage='Click "Create Bot" to get started.'
            expanded={chatExpanded}
            onToggleExpand={() => setChatExpanded((v) => !v)}
          />
        </div>
      </div>

      {/* Bot Creation Wizard */}
      <BotWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={fetchBots}
        userId={user?.id}
        workspaceId={activeWorkspace?.id}
      />
      <EditBotModal
        bot={editingBot}
        onClose={() => setEditingBot(null)}
        onSaved={(updatedBot) => {
          setBots((prev) =>
            prev.map((bot) => (bot.id === updatedBot.id ? updatedBot : bot))
          );
          setEditingBot(null);
        }}
      />
      <EmbedCodeModal
        bot={embedBot}
        embedUrl={embedBot ? getEmbedUrl(embedBot.id) : ""}
        onClose={() => setEmbedBot(null)}
      />
    </div>
  );
}

function EmbedCodeModal({
  bot,
  embedUrl,
  onClose,
}: {
  bot: BotRecord | null;
  embedUrl: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"iframe" | "floating">("iframe");

  if (!bot) return null;

  const iframeCode = `<iframe
  src="${embedUrl}"
  style="width: 100vw; height: 100vh; border: 0; display: block;"
  allow="clipboard-write"
></iframe>`;

const floatingCode = `<div style="position: fixed; right: 24px; bottom: 24px; z-index: 9999;">
  <iframe
    src="${embedUrl}"
    title="${bot.name} chat"
    style="width: 380px; height: 620px; border: 0; border-radius: 16px; display: block; box-shadow: 0 20px 60px rgba(0,0,0,.18);"
    allow="clipboard-write"
  ></iframe>
</div>`;

  const code = mode === "iframe" ? iframeCode : floatingCode;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Embed code copied");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-950">Web Embed Code</h3>
            <p className="text-sm text-slate-500">{bot.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("iframe")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "iframe"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Iframe
            </button>
            <button
              type="button"
              onClick={() => setMode("floating")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "floating"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Floating Widget
            </button>
          </div>

          <textarea
            readOnly
            value={code}
            rows={mode === "iframe" ? 6 : 9}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 outline-none"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Embed links use your deployed webchat domain.
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-primary/90"
            >
              <Copy className="h-4 w-4" />
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

interface ChatPanelProps {
  bots: BotRecord[];
  user?: AppUser | null;
  emptyStateMessage?: string;
  noItemsMessage?: string;
  useAddToStartMessage?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

function ChatPanel({
  bots,
  user,
  emptyStateMessage,
  noItemsMessage,
  useAddToStartMessage,
  expanded,
  onToggleExpand,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const hasBots = bots.length > 0;
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: hasBots
        ? "Select a bot above, then send a message to start chatting."
        : emptyStateMessage ?? "Create a bot to enable the chat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const streamContentRef = useRef("");

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const welcome = hasBots
      ? "Select a bot above, then send a message to start chatting."
      : emptyStateMessage ?? "Create a bot to enable the chat.";
    setMessages([{ role: "assistant", content: welcome }]);
    setInput("");
  }, [hasBots, emptyStateMessage]);

  useEffect(() => {
    if (!selectedBotId && bots.length > 0 && bots[0]) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  const disabledReason = !hasBots
    ? emptyStateMessage ?? "Create a bot to enable chat."
    : !selectedBotId
      ? "Select a bot to chat."
      : null;

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: hasBots
          ? "Select a bot above, then send a message to start chatting."
          : emptyStateMessage ?? "Create a bot to enable the chat.",
      },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !selectedBotId) return;

    setSending(true);
    streamContentRef.current = "";
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    const appendToken = (chunk: string) => {
      const prev = streamContentRef.current;
      const needsSpace =
        prev.length > 0 &&
        !/[\s\u00A0]$/.test(prev) &&
        chunk.length > 0 &&
        !/^[\s\u00A0]/.test(chunk);
      streamContentRef.current = prev + (needsSpace ? " " : "") + chunk;
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          next[next.length - 1] = {
            ...last,
            content: streamContentRef.current,
          };
        }
        return next;
      });
    };

    try {
      await new Promise((r) => setTimeout(r, 0));
      await agentChatAPI.stream(
        text,
        selectedBotId,
        { conversationId, userId: user?.id ?? undefined },
        {
          onToken: appendToken,
          onDone(data) {
            if (data.full_text != null) {
              streamContentRef.current = data.full_text;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: data.full_text ?? streamContentRef.current,
                  };
                }
                return next;
              });
            }
          },
          onError(err) {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === "assistant" && !last.content) {
                next[next.length - 1] = {
                  ...last,
                  content: `**Error**\n\n${err.message}`,
                  isError: true,
                };
              }
              return next;
            });
          },
        }
      );
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          next[next.length - 1] = {
            ...last,
            content: `**Connection Error**\n\n${errMessage}`,
            isError: true,
          };
        }
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabledReason) {
        handleSend();
      }
    }
  };

  const selectedBot = bots.find((b) => b.id === selectedBotId);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className="flex-none border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 space-y-3"
        data-tour="test-chat-section"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold text-gray-900">Test Chat</h3>
          <div className="flex items-center gap-1">
            {hasBots && conversationId && (
              <button
                type="button"
                onClick={handleNewChat}
                className="text-xs font-medium text-teal-primary hover:underline"
              >
                New chat
              </button>
            )}
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={expanded ? "Minimize chat" : "Expand chat"}
                title={expanded ? "Minimize" : "Expand"}
              >
                {expanded ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
        {hasBots && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Bot
            </label>
            <select
              value={selectedBotId ?? ""}
              onChange={(e) => setSelectedBotId(e.target.value || null)}
              className="w-full rounded-lg border border-dashboard-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary"
            >
              <option value="">Select a bot...</option>
              {bots.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.telegramUsername ? ` (@${b.telegramUsername})` : ""} -{" "}
                  {MODEL_LABELS[b.modelId ?? ""] ?? b.modelId ?? b.model}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative bg-gradient-to-b from-transparent to-slate-50/20">
        <div
          ref={listRef}
          className="h-full overflow-y-auto px-6 py-6 scroll-smooth space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 p-1 shadow-sm ring-2 ring-teal-200/50 overflow-hidden">
                  {selectedBot?.profilePictureUrl ? (
                    <Image
                      src={selectedBot.profilePictureUrl}
                      alt="Bot"
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Bot className="h-4 w-4 text-teal-primary" />
                  )}
                </div>
              )}

              <div
                className={`group relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-200 ${
                  message.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-sky-500 via-sky-500 to-sky-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30"
                    : message.isError
                      ? "rounded-bl-md border-2 border-red-200 bg-red-50 text-red-900 shadow-sm"
                      : "rounded-bl-md border border-dashboard-border bg-white text-slate-800 shadow-md hover:shadow-lg"
                }`}
              >
                {message.role === "assistant" ? (
                  index === messages.length - 1 &&
                  sending &&
                  !message.content.trim() ? (
                    <div
                      className="flex items-center gap-1 py-1"
                      aria-label="Getting response..."
                    >
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 list-disc list-inside space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2 list-decimal list-inside space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="ml-2">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-900">
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-teal-primary border border-dashboard-border">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="font-medium">{message.content}</div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm">
                  <span className="text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {disabledReason && (
          <div className="absolute inset-0 -z-10 bg-white/50 backdrop-blur-sm p-6 space-y-4 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 text-center max-w-xs">
                <div className="h-10 w-10 rounded-full bg-teal-primary/10 flex items-center justify-center text-teal-primary mb-1">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {noItemsMessage ?? "No bots yet"}
                </p>
                <p className="text-xs text-slate-500">
                  {useAddToStartMessage ?? "Create a bot to start testing."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none border-t border-dashboard-border bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 px-6 py-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={!!disabledReason}
              className="w-full resize-none rounded-xl border-2 border-dashboard-border bg-white px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-sm hover:border-slate-300"
              style={{ minHeight: "50px", maxHeight: "120px" }}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending || !!disabledReason}
            className="group relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-500 to-sky-500 text-white shadow-lg shadow-sky-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-sky-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
            title={sending ? "Sending..." : "Send"}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            )}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity group-hover:opacity-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditBotModalProps {
  bot: BotRecord | null;
  onClose: () => void;
  onSaved: (bot: BotRecord) => void;
}

function EditBotModal({ bot, onClose, onSaved }: EditBotModalProps) {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelProvider, setModelProvider] = useState<AgentModel>("openai");
  const [modelId, setModelId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bot) return;
    const nextProvider = MODEL_PROVIDERS.includes(bot.model as AgentModel)
      ? (bot.model as AgentModel)
      : "openai";
    const providerModels = MODEL_IDS_BY_PROVIDER[nextProvider];
    setName(bot.name);
    setSystemPrompt(bot.systemPrompt);
    setModelProvider(nextProvider);
    setModelId(
      bot.modelId && providerModels.includes(bot.modelId)
        ? bot.modelId
        : (providerModels[0] ?? "")
    );
    setError(null);
    setSaving(false);
  }, [bot]);

  if (!bot) return null;

  const handleSave = async () => {
    if (!systemPrompt.trim()) {
      setError("System prompt is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await agentsAPI.update(bot.id, {
        name: name.trim() || "Unnamed Bot",
        model: modelProvider,
        model_id: modelId || null,
        system_prompt: systemPrompt.trim(),
      });

      onSaved(botFromAPI(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-dashboard-border px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Bot</h3>
            <p className="text-xs text-slate-500">
              Update the bot prompt and model configuration.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Bot"
              className="w-full rounded-xl border border-dashboard-border bg-slate-50 px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-teal-primary focus:bg-white focus:ring-2 focus:ring-teal-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8}
              placeholder="You are a helpful assistant that..."
              className="w-full resize-none rounded-xl border border-dashboard-border bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-teal-primary focus:bg-white focus:ring-2 focus:ring-teal-primary/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Provider
              </label>
              <select
                value={modelProvider}
                onChange={(e) => {
                  const next = e.target.value as AgentModel;
                  setModelProvider(next);
                  setModelId(MODEL_IDS_BY_PROVIDER[next]?.[0] ?? "");
                }}
                className="w-full rounded-xl border border-dashboard-border bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-teal-primary focus:bg-white focus:ring-2 focus:ring-teal-primary/20"
              >
                {MODEL_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Model
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full rounded-xl border border-dashboard-border bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-teal-primary focus:bg-white focus:ring-2 focus:ring-teal-primary/20"
              >
                {MODEL_IDS_BY_PROVIDER[modelProvider]?.map((id) => (
                  <option key={id} value={id}>
                    {MODEL_LABELS[id] ?? id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-dashboard-border bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
