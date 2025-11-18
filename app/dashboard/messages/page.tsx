"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  integrationsAPI,
  type Conversation,
  type Message,
} from "@/lib/api/integrations";
import { MessageSquare, Send } from "lucide-react";

type ChannelType = "instagram" | "telegram";

// Dummy data for Instagram conversations
const dummyInstagramConversations: Conversation[] = [
  {
    id: "inst_conv_1",
    participant_id: "user_1",
    participant_name: "User 1",
    participant_avatar: undefined,
    last_message: "Thanks for the quick response!",
    last_message_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    unread_count: 2,
  },
  {
    id: "inst_conv_2",
    participant_id: "user_2",
    participant_name: "User 2",
    participant_avatar: undefined,
    last_message: "I'll check that for you right away.",
    last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unread_count: 0,
  },
];

// Dummy data for Instagram messages
const dummyInstagramMessages: Record<string, Message[]> = {
  inst_conv_1: [
    {
      id: "inst_msg_1",
      text: "Hi! I have a question about your product.",
      sender_id: "user_1",
      sender_name: "User 1",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      is_from_me: false,
    },
    {
      id: "inst_msg_2",
      text: "Hello! I'd be happy to help. What would you like to know?",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_from_me: true,
    },
    {
      id: "inst_msg_3",
      text: "I'm interested in the pricing plans. Can you tell me more?",
      sender_id: "user_1",
      sender_name: "User 1",
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
      sender_name: "User 1",
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
      sender_name: "User 1",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      is_from_me: false,
    },
  ],
  inst_conv_2: [
    {
      id: "inst_msg_8",
      text: "Hello, I need help with my account.",
      sender_id: "user_2",
      sender_name: "User 2",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      is_from_me: false,
    },
    {
      id: "inst_msg_9",
      text: "Hi! I'm here to help. What seems to be the issue?",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: true,
    },
    {
      id: "inst_msg_10",
      text: "I can't log into my account. It says my password is incorrect.",
      sender_id: "user_2",
      sender_name: "User 2",
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
    participant_name: "User 1",
    participant_avatar: undefined,
    last_message: "Perfect! I'll sign up today.",
    last_message_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    unread_count: 1,
  },
  {
    id: "tg_conv_2",
    participant_id: "user_2",
    participant_name: "User 2",
    participant_avatar: undefined,
    last_message: "Got it, thanks!",
    last_message_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    unread_count: 0,
  },
];

// Dummy data for Telegram messages
const dummyTelegramMessages: Record<string, Message[]> = {
  tg_conv_1: [
    {
      id: "tg_msg_1",
      text: "Hey! Is the service available 24/7?",
      sender_id: "user_1",
      sender_name: "User 1",
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
      sender_name: "User 1",
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
      sender_name: "User 1",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      is_from_me: false,
    },
  ],
  tg_conv_2: [
    {
      id: "tg_msg_6",
      text: "Hi, can you help me with integration?",
      sender_id: "user_2",
      sender_name: "User 2",
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
      sender_name: "User 2",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: false,
    },
    {
      id: "tg_msg_9",
      text: "Great! We have a Shopify plugin available. I'll send you the setup guide.",
      sender_id: "me",
      sender_name: "You",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), // 3h 55m ago
      is_from_me: true,
    },
    {
      id: "tg_msg_10",
      text: "Got it, thanks!",
      sender_id: "user_2",
      sender_name: "User 2",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_from_me: false,
    },
  ],
};

export default function MessagesPage() {
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
      } catch (err: any) {
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
            if (data.length === 0 && dummyInstagramMessages[selectedConversation.id]) {
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
            if (data.length === 0 && dummyTelegramMessages[selectedConversation.id]) {
              data = dummyTelegramMessages[selectedConversation.id];
            }
          } catch {
            data = dummyTelegramMessages[selectedConversation.id] || [];
          }
        }
        setMessages(data);
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
      return "Yesterday";
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
        <p className="text-gray-500">Please select a workspace</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] -m-6">
      {/* Nested Sidebar - Channel Selection */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <button
            onClick={() => {
              setSelectedChannel("instagram");
              setSelectedConversation(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
              selectedChannel === "instagram"
                ? "bg-sky-100 text-sky-700 font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src="/yetti/instagram.png"
                alt="Instagram"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium">Instagram</span>
          </button>
          <button
            onClick={() => {
              setSelectedChannel("telegram");
              setSelectedConversation(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              selectedChannel === "telegram"
                ? "bg-sky-100 text-sky-700 font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src="/yetti/telegram_1.png"
                alt="Telegram"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium">Telegram</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="text-sm font-semibold text-gray-900 capitalize">
              {selectedChannel} Inbox
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">Loading conversations...</p>
              </div>
            ) : error && conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-gray-500 text-sm text-center">
                  No conversations found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-white border-l-4 border-sky-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
                        {conversation.participant_avatar ? (
                          <Image
                            src={conversation.participant_avatar}
                            alt={conversation.participant_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-500 font-semibold">
                            {conversation.participant_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.participant_name}
                          </h4>
                          {conversation.last_message_time && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(conversation.last_message_time)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message || "No messages yet"}
                        </p>
                        {conversation.unread_count &&
                          conversation.unread_count > 0 && (
                            <div className="mt-1">
                              <span className="inline-flex items-center justify-center h-5 px-2 text-xs font-semibold text-white bg-sky-500 rounded-full">
                                {conversation.unread_count}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
                    {selectedConversation.participant_avatar ? (
                      <Image
                        src={selectedConversation.participant_avatar}
                        alt={selectedConversation.participant_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-500 font-semibold">
                        {selectedConversation.participant_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {selectedConversation.participant_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedChannel === "instagram"
                        ? "Instagram"
                        : "Telegram"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                  </div>
                ) : error && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.is_from_me ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.is_from_me
                            ? "bg-sky-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.is_from_me
                              ? "text-sky-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    disabled
                  />
                  <button
                    disabled
                    className="rounded-lg bg-sky-500 p-2 text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

