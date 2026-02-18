"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { chatAPI } from "@/lib/api/chat";
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
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export type AgentRecord = {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  apiKey: string; // stored in state; display masked
};

const MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
  "claude-3-5-sonnet-20241022",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
];

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export default function AgentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { onNavigateToKnowledgeBase, onTestAgentMessageCompleted } =
    useOnboardingTour();
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [agentSystemPrompt, setAgentSystemPrompt] = useState("");
  const [agentModel, setAgentModel] = useState(MODELS[0]);
  const [agentApiKey, setAgentApiKey] = useState("");
  const [agentName, setAgentName] = useState("");
  const [addAgentError, setAddAgentError] = useState<string | null>(null);
  const [addAgentSaving, setAddAgentSaving] = useState(false);

  useEffect(() => {
    onNavigateToKnowledgeBase();
  }, [onNavigateToKnowledgeBase]);

  const hasAgents = agents.length > 0;

  const resetAddAgentForm = useCallback(() => {
    setAgentSystemPrompt("");
    setAgentModel(MODELS[0]);
    setAgentApiKey("");
    setAgentName("");
    setAddAgentError(null);
  }, []);

  const handleAddAgent = useCallback(() => {
    setAddAgentError(null);
    if (!agentSystemPrompt.trim()) {
      setAddAgentError("System prompt is required.");
      return;
    }
    if (!agentApiKey.trim()) {
      setAddAgentError("API key is required.");
      return;
    }
    setAddAgentSaving(true);
    setAgents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: agentName.trim() || "Unnamed agent",
        systemPrompt: agentSystemPrompt.trim(),
        model: agentModel,
        apiKey: agentApiKey.trim(),
      },
    ]);
    resetAddAgentForm();
    setAddAgentSaving(false);
    setAddAgentModalOpen(false);
  }, [
    agentSystemPrompt,
    agentModel,
    agentApiKey,
    agentName,
    resetAddAgentForm,
  ]);

  const handleDeleteAgent = useCallback((id: string) => {
    if (!confirm("Remove this agent? This cannot be undone.")) return;
    setAgents((prev) => prev.filter((a) => a.id !== id));
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
                AI Agents
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg text-white/80 max-w-xl">
                Create and manage your agents. Configure system prompts, models,
                and API keys—then test them in the chat.
              </p>
            </div>
          </div>
          <div className="relative z-50 shrink-0">
            <button
              type="button"
              data-tour="add-agent-button"
              onClick={() => {
                resetAddAgentForm();
                setAddAgentModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3 text-sm font-bold transition-all hover:bg-teal-primary/10 hover:text-teal-primary shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Add Agent
            </button>
          </div>
        </div>
      </div>

      {/* Agents list + Test Chat */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-start">
        <div className="flex min-h-[320px] h-[40vh] sm:h-[420px] xl:h-[522px] flex-1 flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card shadow-lg min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 border-b border-dashboard-border bg-gradient-to-br from-dashboard-bg via-teal-primary/5 to-dashboard-bg px-4 sm:px-6 py-3 sm:py-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-teal-primary" />
                Your Agents
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {agents.length === 0
                  ? "No agents yet"
                  : agents.length === 1
                    ? "1 agent"
                    : `${agents.length} agents`}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {agents.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    No agents yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Use “Add Agent” to create your first agent.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashboard-border bg-white p-4 shadow-sm hover:border-teal-primary/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {agent.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {agent.model}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {agent.systemPrompt.slice(0, 60)}
                        {agent.systemPrompt.length > 60 ? "…" : ""}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        API key: {maskApiKey(agent.apiKey)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove agent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-[320px] h-[40vh] sm:h-[420px] xl:h-[520px] xl:w-[360px] xl:flex-shrink-0 min-w-0">
          <ChatPanel
            hasKnowledge={hasAgents}
            hasGoogleSheet={false}
            user={user}
            onTestAgentMessageCompleted={onTestAgentMessageCompleted}
            emptyStateMessage="Add an agent to enable the chat."
            noItemsMessage="No agents yet"
            useAddToStartMessage="Use “Add Agent” to get started."
          />
        </div>
      </div>

      {/* Add Agent Modal */}
      {addAgentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-primary/10 text-teal-primary shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Add Agent
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure system prompt, model, and API key.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetAddAgentForm();
                    setAddAgentModalOpen(false);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {addAgentError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {addAgentError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Agent name (optional)
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Support Bot, Sales Assistant"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    System prompt
                  </label>
                  <textarea
                    value={agentSystemPrompt}
                    onChange={(e) => setAgentSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant. You..."
                    rows={5}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Model
                  </label>
                  <select
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  >
                    {MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    API key
                  </label>
                  <input
                    type="password"
                    value={agentApiKey}
                    onChange={(e) => setAgentApiKey(e.target.value)}
                    placeholder="sk-... or your provider API key"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-dashboard-border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                    autoComplete="off"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 ml-1">
                    Stored locally in this browser. Never shared with our
                    servers.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddAgent}
                  disabled={addAgentSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-primary text-white px-4 py-3 text-sm font-bold shadow-lg shadow-teal-primary/25 hover:bg-teal-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addAgentSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Agent"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAddAgentForm();
                    setAddAgentModalOpen(false);
                  }}
                  className="px-4 py-3 border border-dashboard-border text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

interface ChatPanelProps {
  hasKnowledge: boolean;
  hasGoogleSheet: boolean;
  user?: User | null;
  onTestAgentMessageCompleted?: () => void;
  emptyStateMessage?: string;
  noItemsMessage?: string;
  useAddToStartMessage?: string;
}

function ChatPanel({
  hasKnowledge,
  hasGoogleSheet,
  user,
  onTestAgentMessageCompleted,
  emptyStateMessage,
  noItemsMessage,
  useAddToStartMessage,
}: ChatPanelProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: hasGoogleSheet
        ? "Chat is disabled when a Google Sheet is connected."
        : hasKnowledge
          ? "Hi! Ask me anything about your knowledge library."
          : (emptyStateMessage ?? "Add knowledge to enable the chat."),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: hasGoogleSheet
          ? "Chat is disabled when a Google Sheet is connected."
          : hasKnowledge
            ? "Hi! Ask me anything about your knowledge library."
            : (emptyStateMessage ?? "Add knowledge to enable the chat."),
      },
    ]);
    setInput("");
  }, [hasKnowledge, hasGoogleSheet, emptyStateMessage]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        const content = hasGoogleSheet
          ? t("knowledgeBase.chatDisabledWithSheet")
          : hasKnowledge
            ? t("knowledgeBase.chatWelcome")
            : (emptyStateMessage ??
              t("knowledgeBase.addKnowledgeToEnableChat"));
        if (prev[0].content === content) {
          return prev;
        }
        return [{ role: "assistant", content }];
      }
      return prev;
    });
  }, [hasKnowledge, hasGoogleSheet, emptyStateMessage, t]);

  const disabledReason = hasGoogleSheet
    ? "Chat is disabled when a Google Sheet is connected."
    : !hasKnowledge
      ? (emptyStateMessage ?? "Add knowledge to enable chat.")
      : null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !hasKnowledge || hasGoogleSheet) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const response = await chatAPI.sendMessage({
        message: text,
        user_id: user?.id,
      });

      let content = "";
      try {
        if (response && typeof response.answer === "string") {
          const match = response.answer.match(/content='([\s\S]*?)'/);

          if (match && match[1]) {
            content = match[1]
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\\\/g, "\\")
              .replace(/\\"/g, '"');
          } else {
            content = response.answer;
          }
        } else if (
          response &&
          response.answer &&
          typeof response.answer === "object" &&
          "content" in response.answer &&
          typeof (response.answer as { content?: unknown }).content === "string"
        ) {
          content = (response.answer as { content: string }).content;
        } else {
          content = JSON.stringify(response);
        }
      } catch (error) {
        console.error("Error extracting assistant content:", error);
        const fallbackAnswer = response?.answer;
        content =
          typeof fallbackAnswer === "string"
            ? fallbackAnswer
            : JSON.stringify(fallbackAnswer ?? "");
      }

      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          { role: "assistant" as const, content },
        ];

        if (onTestAgentMessageCompleted) {
          const assistantMessages = newMessages.filter(
            (m) => m.role === "assistant" && m.content && !m.isError,
          );
          const userMessages = newMessages.filter(
            (m) => m.role === "user",
          ).length;

          if (userMessages > 0 && assistantMessages.length > 1) {
            setTimeout(() => {
              onTestAgentMessageCompleted();
            }, 500);
          }
        }

        return newMessages;
      });
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const errorMessage =
        (error instanceof Error ? error.message : undefined) ||
        "Failed to send message. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Connection Error**\n\nI'm having trouble connecting right now. ${errorMessage}\n\nPlease try again in a moment.`,
          isError: true,
        } as ChatMessage,
      ]);
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className="flex-none border-b border-gray-200 px-6 py-4"
        data-tour="test-chat-section"
      >
        <h3 className="text-xl font-semibold text-gray-900">Test Chat</h3>
        <p className="text-xs text-gray-500">Chat</p>
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
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 p-1 shadow-sm ring-2 ring-sky-200/50">
                  <Image
                    src="/yetti/logo2.jpg"
                    alt="Admin"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
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
                        h1: ({ children }) => (
                          <h1 className="mb-2 text-base font-bold">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 text-sm font-bold">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 text-xs font-bold">{children}</h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
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
                ) : (
                  <div className="font-medium">{message.content}</div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm">
                  <span className="text-xs font-bold">
                    {t("knowledgeBase.you")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {disabledReason && (
          <div className="absolute inset-0 -z-10 bg-white/50 backdrop-blur-sm p-6 space-y-4 overflow-hidden">
            {hasGoogleSheet ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 text-center max-w-xs">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-1">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {t("knowledgeBase.chatDisabled")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("knowledgeBase.chatNotAvailableWithSheet")}
                  </p>
                </div>
              </div>
            ) : !hasKnowledge ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 text-center max-w-xs">
                  <div className="h-10 w-10 rounded-full bg-teal-primary/10 flex items-center justify-center text-teal-primary mb-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {noItemsMessage ?? t("knowledgeBase.noKnowledgeYet")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {useAddToStartMessage ??
                      t("knowledgeBase.useAddKnowledgeToStart")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 opacity-50">
                  <div className="flex justify-start">
                    <div className="h-10 w-3/4 rounded-2xl rounded-tl-none bg-slate-100 animate-pulse" />
                  </div>
                  <div className="flex justify-end">
                    <div className="h-16 w-2/3 rounded-2xl rounded-tr-none bg-teal-primary/10 animate-pulse" />
                  </div>
                  <div className="flex justify-start">
                    <div className="h-12 w-1/2 rounded-2xl rounded-tl-none bg-slate-100 animate-pulse" />
                  </div>
                  <div className="flex justify-end">
                    <div className="h-8 w-1/3 rounded-2xl rounded-tr-none bg-teal-primary/10 animate-pulse" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-slate-100 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-teal-primary animate-spin" />
                    <span className="text-sm font-medium text-slate-600">
                      {t("knowledgeBase.loadingChat")}
                    </span>
                  </div>
                </div>
              </>
            )}
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
              placeholder={t("knowledgeBase.typeMessage")}
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
            title={
              sending ? t("knowledgeBase.sending") : t("knowledgeBase.send")
            }
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
