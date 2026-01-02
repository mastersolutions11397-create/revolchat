"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  integrationsAPI,
  type Conversation,
  type Message,
} from "@/lib/api/integrations";
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
} from "lucide-react";

type ChannelType = "instagram" | "telegram";

// Dummy data for Instagram conversations
const dummyInstagramConversations: Conversation[] = [
  {
    id: "inst_conv_1",
    participant_id: "user_1",
    participant_name: "Lead 1",
    participant_avatar: undefined,
    last_message: "Thanks for the quick response!",
    last_message_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    unread_count: 2,
  },
  {
    id: "inst_conv_2",
    participant_id: "user_2",
    participant_name: "Lead 2",
    participant_avatar: undefined,
    last_message: "I'll check that for you right away.",
    last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unread_count: 0,
  },
  {
    id: "inst_conv_3",
    participant_id: "user_3",
    participant_name: "Lead 3",
    participant_avatar: undefined,
    last_message: "Interested in your services",
    last_message_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    unread_count: 1,
  },
];

// Dummy data for Instagram messages
const dummyInstagramMessages: Record<string, Message[]> = {
  inst_conv_1: [
    {
      id: "inst_msg_1",
      text: "Hi! I have a question about your product.",
      sender_id: "user_1",
      sender_name: "Sarah Johnson",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      is_from_me: false,
    },
    {
      id: "inst_msg_2",
      text: "Hello Sarah! I'd be happy to help. What would you like to know?",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_from_me: true,
    },
    {
      id: "inst_msg_3",
      text: "I'm interested in the pricing plans. Can you tell me more?",
      sender_id: "user_1",
      sender_name: "Sarah Johnson",
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
      is_from_me: false,
    },
    {
      id: "inst_msg_4",
      text: "Of course! We have three plans: Basic, Pro, and Enterprise. The Basic plan starts at $29/month.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      is_from_me: true,
    },
    {
      id: "inst_msg_5",
      text: "That sounds great! What features are included in the Basic plan?",
      sender_id: "user_1",
      sender_name: "Sarah Johnson",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      is_from_me: false,
    },
    {
      id: "inst_msg_6",
      text: "The Basic plan includes 10,000 messages per month, email support, and all core features.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
      is_from_me: true,
    },
    {
      id: "inst_msg_7",
      text: "Thanks for the quick response!",
      sender_id: "user_1",
      sender_name: "Sarah Johnson",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      is_from_me: false,
    },
  ],
  inst_conv_2: [
    {
      id: "inst_msg_8",
      text: "Hello, I need help with my account.",
      sender_id: "user_2",
      sender_name: "Michael Chen",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      is_from_me: false,
    },
    {
      id: "inst_msg_9",
      text: "Hi Michael! I'm here to help. What seems to be the issue?",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: true,
    },
    {
      id: "inst_msg_10",
      text: "I can't log into my account. It says my password is incorrect.",
      sender_id: "user_2",
      sender_name: "Michael Chen",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      is_from_me: false,
    },
    {
      id: "inst_msg_11",
      text: "I'll check that for you right away.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_from_me: true,
    },
  ],
};

// Dummy data for Telegram conversations
const dummyTelegramConversations: Conversation[] = [
  {
    id: "tg_conv_1",
    participant_id: "user_1",
    participant_name: "Lead 4",
    participant_avatar: undefined,
    last_message: "Perfect! I'll sign up today.",
    last_message_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    unread_count: 1,
  },
  {
    id: "tg_conv_2",
    participant_id: "user_2",
    participant_name: "Lead 5",
    participant_avatar: undefined,
    last_message: "Got it, thanks!",
    last_message_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    unread_count: 0,
  },
  {
    id: "tg_conv_3",
    participant_id: "user_3",
    participant_name: "Lead 6",
    participant_avatar: undefined,
    last_message: "Can you provide more details?",
    last_message_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    unread_count: 3,
  },
];

// Dummy data for Telegram messages
const dummyTelegramMessages: Record<string, Message[]> = {
  tg_conv_1: [
    {
      id: "tg_msg_1",
      text: "Hey! Is the service available 24/7?",
      sender_id: "user_1",
      sender_name: "Emma Wilson",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_from_me: false,
    },
    {
      id: "tg_msg_2",
      text: "Yes, absolutely! Our service is available 24/7 to assist you anytime.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
      is_from_me: true,
    },
    {
      id: "tg_msg_3",
      text: "That's amazing! How do I get started?",
      sender_id: "user_1",
      sender_name: "Emma Wilson",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      is_from_me: false,
    },
    {
      id: "tg_msg_4",
      text: "You can sign up on our website. It only takes a few minutes to set up your account.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      is_from_me: true,
    },
    {
      id: "tg_msg_5",
      text: "Perfect! I'll sign up today.",
      sender_id: "user_1",
      sender_name: "Emma Wilson",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      is_from_me: false,
    },
  ],
  tg_conv_2: [
    {
      id: "tg_msg_6",
      text: "Hi, can you help me with integration?",
      sender_id: "user_2",
      sender_name: "James Rodriguez",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      is_from_me: false,
    },
    {
      id: "tg_msg_7",
      text: "Sure! What platform are you looking to integrate with?",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      is_from_me: true,
    },
    {
      id: "tg_msg_8",
      text: "I want to integrate with my Shopify store.",
      sender_id: "user_2",
      sender_name: "James Rodriguez",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: false,
    },
    {
      id: "tg_msg_9",
      text: "Great! We have a Shopify plugin available. I'll send you the setup guide.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(
        Date.now() - 4 * 60 * 60 * 1000 + 5 * 60 * 1000
      ).toISOString(), // 3h 55m ago
      is_from_me: true,
    },
    {
      id: "tg_msg_10",
      text: "Got it, thanks!",
      sender_id: "user_2",
      sender_name: "James Rodriguez",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: false,
    },
  ],
};

export default function LeadsPage() {
  const { t } = useLanguage();
  const { selectedWorkspaceId, currentWorkspace } = useWorkspace();
  const workspaceId = useMemo(
    () => selectedWorkspaceId || currentWorkspace?.id || null,
    [selectedWorkspaceId, currentWorkspace?.id]
  );

  const [selectedChannel, setSelectedChannel] =
    useState<ChannelType>("instagram");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations when channel or workspace changes
  useEffect(() => {
    if (!workspaceId) return;

    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Conversation[] = [];
        if (selectedChannel === "instagram") {
          // Try API first, fallback to dummy data
          try {
            data = await integrationsAPI.getInstagramConversations(workspaceId);
            if (data.length === 0) {
              data = dummyInstagramConversations;
            }
          } catch {
            data = dummyInstagramConversations;
          }
        } else {
          // Try API first, fallback to dummy data
          try {
            data = await integrationsAPI.getTelegramConversations(workspaceId);
            if (data.length === 0) {
              data = dummyTelegramConversations;
            }
          } catch {
            data = dummyTelegramConversations;
          }
        }
        setConversations(data);
        // Auto-select first conversation if available
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (err: unknown) {
        // Fallback to dummy data on error
        const dummyData =
          selectedChannel === "instagram"
            ? dummyInstagramConversations
            : dummyTelegramConversations;
        setConversations(dummyData);
        if (dummyData.length > 0 && !selectedConversation) {
          setSelectedConversation(dummyData[0]);
        }
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [workspaceId, selectedChannel]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!workspaceId || !selectedConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Message[] = [];
        if (selectedChannel === "instagram") {
          // Try API first, fallback to dummy data
          try {
            data = await integrationsAPI.getInstagramMessages(
              workspaceId,
              selectedConversation.id
            );
            if (
              data.length === 0 &&
              dummyInstagramMessages[selectedConversation.id]
            ) {
              data = dummyInstagramMessages[selectedConversation.id];
            }
          } catch {
            data = dummyInstagramMessages[selectedConversation.id] || [];
          }
        } else {
          // Try API first, fallback to dummy data
          try {
            data = await integrationsAPI.getTelegramMessages(
              workspaceId,
              selectedConversation.id
            );
            if (
              data.length === 0 &&
              dummyTelegramMessages[selectedConversation.id]
            ) {
              data = dummyTelegramMessages[selectedConversation.id];
            }
          } catch {
            data = dummyTelegramMessages[selectedConversation.id] || [];
          }
        }
        setMessages(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // Fallback to dummy data on error
        const dummyData =
          selectedChannel === "instagram"
            ? dummyInstagramMessages[selectedConversation.id] || []
            : dummyTelegramMessages[selectedConversation.id] || [];
        setMessages(dummyData);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
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
      return t("messages.yesterday");
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">{t("messages.selectWorkspace")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Sidebar - Channel Selection & Conversations */}
      <div className="w-80 flex flex-col border-r border-slate-200 bg-slate-50/50">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {t("messages.title")}
          </h2>

          {/* Channel Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setSelectedChannel("instagram");
                setSelectedConversation(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedChannel === "instagram"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="relative h-5 w-5">
                <Image
                  src="/yetti/instagram_logo.png"
                  alt={t("messages.instagram")}
                  fill
                  className="object-contain"
                />
              </div>
              Instagram
            </button>
            <button
              onClick={() => {
                setSelectedChannel("telegram");
                setSelectedConversation(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedChannel === "telegram"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="relative h-5 w-5">
                <Image
                  src="/yetti/telegram_logo.png"
                  alt={t("messages.telegram")}
                  fill
                  className="object-contain"
                />
              </div>
              Telegram
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 bg-white/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("messages.search")}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <p className="text-slate-500 text-sm">{t("messages.loading")}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="text-slate-500 text-sm">{t("messages.noLeads")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-4 hover:bg-white transition-all duration-200 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-white border-l-4 border-sky-500 shadow-sm"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                      <MessageSquare className="h-6 w-6 text-sky-500" />
                      {selectedChannel === "instagram" ? (
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-white rounded-full p-0.5">
                          <Image
                            src="/yetti/instagram_logo.png"
                            alt="IG"
                            width={12}
                            height={12}
                          />
                        </div>
                      ) : (
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-white rounded-full p-0.5">
                          <Image
                            src="/yetti/telegram_logo.png"
                            alt="TG"
                            width={12}
                            height={12}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            selectedConversation?.id === conversation.id
                              ? "text-sky-900"
                              : "text-slate-900"
                          }`}
                        >
                          {conversation.participant_name}
                        </h4>
                        {conversation.last_message_time && (
                          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate ${
                          conversation.unread_count &&
                          conversation.unread_count > 0
                            ? "text-slate-900 font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {conversation.last_message || t("messages.noMessages")}
                      </p>
                    </div>
                    {conversation.unread_count &&
                      conversation.unread_count > 0 && (
                        <div className="flex flex-col justify-center h-full ml-2">
                          <span className="flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 text-[10px] font-bold text-white bg-sky-500 rounded-full shadow-sm shadow-sky-200">
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
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedConversation.participant_name}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        selectedChannel === "instagram"
                          ? "bg-pink-50 text-pink-600 border border-pink-100"
                          : "bg-sky-50 text-sky-500 border border-sky-100"
                      }`}
                    >
                      {selectedChannel === "instagram"
                        ? t("messages.instagram")
                        : t("messages.telegram")}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("messages.leadConversation")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    <p className="text-slate-400 text-sm">
                      {t("messages.loadingMessages")}
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">
                    {t("messages.noMessages")}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    {t("messages.startConversation")}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isLast = index === messages.length - 1;
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
                          className={`flex-shrink-0 w-8 ${!showAvatar && "invisible"}`}
                        >
                          {showAvatar && (
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                              <MessageSquare className="h-4 w-4 text-sky-500" />
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${message.is_from_me ? "items-end" : "items-start"} max-w-[70%]`}
                      >
                        <div
                          className={`px-5 py-3 shadow-sm ${
                            message.is_from_me
                              ? "bg-gradient-to-br from-sky-500 to-sky-500 text-white rounded-2xl rounded-tr-sm"
                              : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 px-1 ${
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
            <div className="h-24 w-24 bg-white rounded-full shadow-xl shadow-sky-100 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <MessageSquare className="h-10 w-10 text-sky-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t("messages.selectLead")}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              {t("messages.selectLeadDesc")}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
                <div className="relative h-4 w-4">
                  <Image
                    src="/yetti/instagram_logo.png"
                    alt="IG"
                    fill
                    className="object-contain"
                  />
                </div>
                {t("messages.instagram")}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
                <div className="relative h-4 w-4">
                  <Image
                    src="/yetti/telegram_logo.png"
                    alt="TG"
                    fill
                    className="object-contain"
                  />
                </div>
                {t("messages.telegram")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
