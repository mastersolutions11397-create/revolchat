"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { type Conversation, type Message } from "@/lib/api/integrations";
import { MessageSquare, Search, Info, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ChannelType = "telegram" | "instagram";

// Chat history data structure
interface ChatHistoryResponse {
  data: {
    Instagram: ChatHistoryItem[];
    Telegram: ChatHistoryItem[];
  };
}

interface ChatHistoryItem {
  chat_id: string;
  messages: ChatHistoryMessage[];
}

interface ChatHistoryMessage {
  id: number;
  message: string;
  message_source: "agent" | "user";
  created_at: string;
  period_ago: string;
}

// Supabase chat history row type
interface SupabaseChatHistoryRow {
  id: number;
  chat_id: string;
  message: string;
  source: "IG" | "TG";
  message_source: "agent" | "user";
  created_at: string;
  workspace_id: string;
}

// Fetch chat history from Supabase
const fetchChatHistory = async (
  workspaceId: string
): Promise<ChatHistoryResponse> => {
  const { data, error } = await supabase
    .from("yetti_chat_history")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching chat history:", error);
    return { data: { Instagram: [], Telegram: [] } };
  }

  // Initialize grouped data structure
  const groupedData: {
    Instagram: ChatHistoryItem[];
    Telegram: ChatHistoryItem[];
  } = {
    Instagram: [],
    Telegram: [],
  };

  // Group messages by chat_id
  const messagesByChat: Record<
    string,
    { source: "IG" | "TG"; messages: ChatHistoryMessage[] }
  > = {};

  data.forEach((row: SupabaseChatHistoryRow) => {
    if (!messagesByChat[row.chat_id]) {
      messagesByChat[row.chat_id] = {
        source: row.source,
        messages: [],
      };
    }

    messagesByChat[row.chat_id].messages.push({
      id: row.id,
      message: row.message,
      message_source: row.message_source,
      created_at: row.created_at,
      period_ago: "", // This can be calculated if needed
    });
  });

  // Convert to the expected format
  Object.entries(messagesByChat).forEach(([chatId, chatData]) => {
    const platform = chatData.source === "IG" ? "Instagram" : "Telegram";
    groupedData[platform].push({
      chat_id: chatId,
      messages: chatData.messages,
    });
  });

  return { data: groupedData };
};

// Transform chat history data to Conversation format
const transformChatHistoryToConversations = (
  chatHistory: ChatHistoryResponse,
  channel: ChannelType
): Conversation[] => {
  const platformData =
    channel === "instagram"
      ? chatHistory.data.Instagram
      : chatHistory.data.Telegram;

  return platformData.map((chat) => {
    // Sort messages descending to find the most recent message for the conversation
    const sortedMessages = [...chat.messages].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMessages[0];

    return {
      id: `${channel}_${chat.chat_id}`,
      participant_id: `user_${chat.chat_id}`,
      participant_name: `Chat ${chat.chat_id}`,
      participant_avatar: undefined,
      last_message: lastMessage?.message || "",
      last_message_time: lastMessage?.created_at || new Date().toISOString(),
      unread_count: 0,
    };
  });
};

// Transform chat history data to Message format
const transformChatHistoryToMessages = (
  chatHistory: ChatHistoryResponse,
  channel: ChannelType,
  chatId: string
): Message[] => {
  const platformData =
    channel === "instagram"
      ? chatHistory.data.Instagram
      : chatHistory.data.Telegram;
  const chat = platformData.find((c) => c.chat_id === chatId);

  if (!chat) return [];

  // Messages are already sorted by created_at asc, then id asc in the data structure
  return chat.messages.map((msg) => ({
    id: `${channel}_${chatId}_msg_${msg.id}`,
    text: msg.message,
    sender_id: msg.message_source === "agent" ? "agent" : `user_${chatId}`,
    sender_name: msg.message_source === "agent" ? "" : `Chat ${chatId}`,
    timestamp: msg.created_at,
    is_from_me: msg.message_source === "agent",
  }));
};

export default function InboxPage() {
  const { t } = useLanguage();
  const { workspaceId } = useWorkspace();

  const [selectedChannel, setSelectedChannel] =
    useState<ChannelType>("telegram");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChatView, setShowChatView] = useState(false);

  // Load conversations when channel changes
  useEffect(() => {
    if (!workspaceId) return;

    const loadConversations = async () => {
      setLoading(true);
      try {
        const chatHistoryData = await fetchChatHistory(workspaceId);
        const data = transformChatHistoryToConversations(
          chatHistoryData,
          selectedChannel
        );
        setConversations(data);
        // Auto-select first conversation if available
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (err: unknown) {
        console.error("Error loading conversations:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [workspaceId, selectedChannel, selectedConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!workspaceId || !selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        // Extract chat_id from conversation id (remove channel prefix)
        const chatId = selectedConversation.id.replace(
          `${selectedChannel}_`,
          ""
        );
        const chatHistoryData = await fetchChatHistory(workspaceId);
        const data = transformChatHistoryToMessages(
          chatHistoryData,
          selectedChannel,
          chatId
        );
        setMessages(data);
      } catch (err: unknown) {
        console.error("Error loading messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [workspaceId, selectedConversation, selectedChannel]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return t("inbox.yesterday");
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Always call useEffect to avoid conditional hook execution
  useEffect(() => {
    if (!selectedConversation) {
      setShowChatView(false);
    }
  }, [selectedConversation]);

  // Handle conversation selection (mobile: show chat view, desktop: keep sidebar visible)
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Only show chat view on mobile (smaller screens)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowChatView(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-card shadow-xl">
      {/* Sidebar - Channel Selection & Conversations */}
      <div
        className={`${showChatView ? "hidden md:flex" : "flex"} w-full md:w-80 flex flex-col border-r border-dashboard-border bg-dashboard-bg`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-dashboard-border bg-dashboard-card">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
            {t("inbox.chat")}
          </h2>

          {/* Channel - Telegram only */}
          <div className="flex p-1 bg-dashboard-bg rounded-xl">
            <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium bg-dashboard-card text-slate-900 shadow-sm">
              <div className="relative h-4 w-4 sm:h-5 sm:w-5">
                <Image
                  src="/yetti/telegram_logo.png"
                  alt={t("inbox.telegram")}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden sm:inline">{t("inbox.telegram")}</span>
              <span className="sm:hidden">{t("inbox.tg")}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-dashboard-border bg-dashboard-card/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("inbox.search")}
              className="w-full pl-9 pr-4 py-2 bg-dashboard-card border border-dashboard-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-primary border-t-transparent" />
              <p className="text-slate-500 text-xs sm:text-sm">
                {t("inbox.loading")}
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 text-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
              <p className="text-slate-500 text-xs sm:text-sm">{t("inbox.noChat")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`w-full text-left p-3 sm:p-4 hover:bg-dashboard-card transition-all duration-200 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-dashboard-card border-l-4 border-teal-primary shadow-sm"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-xl overflow-hidden bg-teal-primary/10 flex items-center justify-center shadow-sm">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-teal-primary" />
                      <div className="absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-full p-0.5">
                        <Image
                          src="/yetti/telegram_logo.png"
                          alt="TG"
                          width={12}
                          height={12}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <h4
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            selectedConversation?.id === conversation.id
                              ? "text-teal-primary"
                              : "text-slate-900"
                          }`}
                        >
                          {conversation.participant_name}
                        </h4>
                        {conversation.last_message_time && (
                          <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 ml-2">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs sm:text-sm truncate ${
                          conversation.unread_count &&
                          conversation.unread_count > 0
                            ? "text-slate-900 font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {conversation.last_message || t("inbox.noMessage")}
                      </p>
                    </div>
                    {conversation.unread_count &&
                      conversation.unread_count > 0 && (
                        <div className="flex flex-col justify-center h-full ml-1 sm:ml-2">
                          <span className="flex items-center justify-center h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] px-1 sm:px-1.5 text-[10px] font-bold text-white bg-teal-primary rounded-full shadow-sm shadow-teal-primary/20">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Chat Interface */}
      <div
        className={`${!showChatView ? "hidden md:flex" : "flex"} flex-1 flex flex-col bg-dashboard-card relative`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 sm:h-20 px-4 sm:px-6 border-b border-dashboard-border flex items-center justify-between bg-dashboard-card/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setShowChatView(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  aria-label={t("inbox.backToConversations")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-xl overflow-hidden bg-teal-primary/10 flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-teal-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                    <span className="truncate">
                      {selectedConversation.participant_name}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider flex-shrink-0 bg-teal-primary/10 text-teal-primary border border-teal-primary/20">
                      {t("inbox.telegram")}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {t("inbox.chatConversation")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-dashboard-bg/50">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-teal-primary border-t-transparent" />
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {t("inbox.loadingMessages")}
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm sm:text-base text-slate-900 font-medium mb-1">
                    {t("inbox.noMessage")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                    {t("inbox.startConversation")}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const showAvatar =
                    !message.is_from_me &&
                    (index === 0 ||
                      messages[index - 1].is_from_me ||
                      messages[index - 1].sender_id !== message.sender_id);

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.is_from_me ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {!message.is_from_me && (
                        <div
                          className={`flex-shrink-0 w-6 sm:w-8 ${!showAvatar && "invisible"}`}
                        >
                          {showAvatar && (
                            <div className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-lg overflow-hidden bg-teal-primary/10 flex items-center justify-center shadow-sm">
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-teal-primary" />
                            </div>
                          )}
                        </div>
                      )}

                      {message.is_from_me && (
                        <div className="flex-shrink-0 w-6 sm:w-8">
                          <div className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-sm">
                            <Image
                              src="/yetti/yetti_face.png"
                              alt={t("inbox.yettiAgent")}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${message.is_from_me ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}
                      >
                        <div
                          className={`px-3 sm:px-5 py-2 sm:py-3 shadow-sm ${
                            message.is_from_me
                              ? "bg-teal-primary text-white rounded-2xl rounded-tr-sm"
                              : "bg-dashboard-card border border-dashboard-border text-slate-800 rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] mt-1 sm:mt-1.5 px-1 ${
                            message.is_from_me
                              ? "text-slate-400"
                              : "text-slate-400"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-dashboard-bg/50">
            <div className="h-16 w-16 sm:h-24 sm:w-24 bg-dashboard-card rounded-full shadow-xl shadow-teal-primary/10 flex items-center justify-center mb-4 sm:mb-6 animate-in zoom-in duration-500">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-teal-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {t("inbox.selectChat")}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-6 sm:mb-8 px-4">
              {t("inbox.selectChatDesc")}
            </p>
            <div className="flex gap-2 sm:gap-4">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-dashboard-card rounded-full border border-dashboard-border shadow-sm text-xs sm:text-sm text-slate-600">
                <div className="relative h-3 w-3 sm:h-4 sm:w-4">
                  <Image
                    src="/yetti/telegram_logo.png"
                    alt="TG"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="hidden sm:inline">{t("inbox.telegram")}</span>
                <span className="sm:hidden">{t("inbox.tg")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
