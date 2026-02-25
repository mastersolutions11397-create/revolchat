"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useAuth } from "@/lib/auth-context";
import { chatSystemAPI } from "@/lib/api/chat-system";
import { supabase } from "@/lib/supabase";
import type { ChatSession, ChatMessage, SessionWithLastMessage } from "@/lib/types/chat";
import {
  MessageSquare,
  Send,
  Search,
  Info,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ChannelType = "telegram" | "instagram";

export default function MessagesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("telegram");
  const [sessions, setSessions] = useState<SessionWithLastMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionWithLastMessage | null>(null);
  const [showChatView, setShowChatView] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch sessions when channel changes
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await chatSystemAPI.getSessions(selectedChannel);
        setSessions(data);

        // Auto-select first session if available
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0]);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, selectedChannel]);

  // Fetch messages when session is selected
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await chatSystemAPI.getMessages(selectedSession.id);
        setMessages(data);

        // Mark messages as read
        await chatSystemAPI.markMessagesAsRead(selectedSession.id);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedSession]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedSession) return;

    const channel = supabase
      .channel(`chat_messages:${selectedSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if admin is viewing
          if (newMessage.sender_type === "user") {
            chatSystemAPI.markMessagesAsRead(selectedSession.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

  // Real-time subscription for session updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat_sessions:all')
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
        },
        async () => {
          // Refresh sessions list
          try {
            const data = await chatSystemAPI.getSessions(selectedChannel);
            setSessions(data);
          } catch (error) {
            console.error("Error refreshing sessions:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedChannel]);

  const handleSelectSession = (session: SessionWithLastMessage) => {
    setSelectedSession(session);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowChatView(true);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSession || sending) return;

    setSending(true);
    try {
      await chatSystemAPI.sendMessage({
        session_id: selectedSession.id,
        message_text: messageInput,
        sender_type: "admin",
      });

      setMessageInput("");
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleToggleAIMode = async () => {
    if (!selectedSession) return;

    try {
      const updatedSession = await chatSystemAPI.toggleAIMode({
        session_id: selectedSession.id,
        ai_mode: !selectedSession.ai_mode,
      });

      setSelectedSession({ ...selectedSession, ...updatedSession });
      toast.success(
        updatedSession.ai_mode ? "AI mode enabled" : "Manual mode enabled"
      );

      // Refresh sessions to update AI mode status
      const data = await chatSystemAPI.getSessions(selectedChannel);
      setSessions(data);
    } catch (error) {
      console.error("Error toggling AI mode:", error);
      toast.error("Failed to toggle AI mode");
    }
  };

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

  const getDisplayName = (session: SessionWithLastMessage) => {
    return (
      session.external_first_name ||
      session.external_username ||
      `User ${session.external_user_id.slice(0, 6)}`
    );
  };

  const chatContainerClass = isChatExpanded
    ? "fixed inset-0 z-50 flex flex-col md:flex-row h-screen overflow-hidden rounded-none border-0 bg-white shadow-2xl"
    : "flex flex-col md:flex-row h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xl";

  return (
    <div className={chatContainerClass}>
      {/* Sidebar - Channel Selection & Sessions */}
      <div
        className={`${showChatView ? "hidden md:flex" : "flex"} w-full md:w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
            {t("messages.title")}
          </h2>

          {/* Channel Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setSelectedChannel("instagram");
                setSelectedSession(null);
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
                  alt="Instagram"
                  fill
                  className="object-contain"
                />
              </div>
              Instagram
            </button>
            <button
              onClick={() => {
                setSelectedChannel("telegram");
                setSelectedSession(null);
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
                  alt="Telegram"
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
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
              <p className="text-slate-500 text-sm">Loading conversations...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="text-slate-500 text-sm">No conversations yet</p>
              <p className="text-slate-400 text-xs">
                Users will appear here when they start chatting
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left p-3 sm:p-4 hover:bg-white transition-all duration-200 ${
                    selectedSession?.id === session.id
                      ? "bg-white border-l-4 border-sky-500 shadow-sm"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                      <MessageSquare className="h-6 w-6 text-sky-500" />
                      {session.is_online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            selectedSession?.id === session.id
                              ? "text-sky-900"
                              : "text-slate-900"
                          }`}
                        >
                          {getDisplayName(session)}
                        </h4>
                        {session.last_message_time && (
                          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                            {formatTime(session.last_message_time)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm truncate flex-1 ${
                            session.unread_count && session.unread_count > 0
                              ? "text-slate-900 font-medium"
                              : "text-slate-500"
                          }`}
                        >
                          {session.last_message || "No messages yet"}
                        </p>
                        {session.ai_mode && (
                          <Bot className="h-3 w-3 text-sky-500 flex-shrink-0" title="AI Mode Active" />
                        )}
                      </div>
                    </div>
                    {session.unread_count && session.unread_count > 0 && (
                      <div className="flex flex-col justify-center h-full ml-2">
                        <span className="flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 text-[10px] font-bold text-white bg-sky-500 rounded-full shadow-sm shadow-sky-200">
                          {session.unread_count}
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
        className={`${!showChatView ? "hidden md:flex" : "flex"} flex-1 flex flex-col min-w-0 bg-white relative`}
      >
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="h-16 sm:h-20 px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setShowChatView(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />
                  {selectedSession.is_online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                    {getDisplayName(selectedSession)}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        selectedSession.platform === "instagram"
                          ? "bg-pink-50 text-pink-600 border border-pink-100"
                          : "bg-sky-50 text-sky-500 border border-sky-100"
                      }`}
                    >
                      {selectedSession.platform}
                    </span>
                    {selectedSession.is_online && (
                      <span className="text-[10px] text-green-600 font-medium">
                        Online
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSession.ai_mode ? "AI Mode Active" : "Manual Mode"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Mode Toggle */}
                <button
                  onClick={handleToggleAIMode}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedSession.ai_mode
                      ? "bg-sky-100 text-sky-600 hover:bg-sky-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={selectedSession.ai_mode ? "Disable AI Mode" : "Enable AI Mode"}
                >
                  {selectedSession.ai_mode ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={() => setIsChatExpanded((v) => !v)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  aria-label={isChatExpanded ? "Minimize chat" : "Expand chat"}
                  title={isChatExpanded ? "Minimize" : "Expand"}
                >
                  {isChatExpanded ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/30">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-400 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">
                    No messages yet
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Start the conversation with this user
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isFromAdmin = message.sender_type === "admin";
                    const isFromAI = message.sender_type === "ai";
                    const isFromMe = isFromAdmin || isFromAI;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          isFromMe ? "justify-end" : "justify-start"
                        } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        {!isFromMe && (
                          <div className="flex-shrink-0 w-8">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-sm">
                              <MessageSquare className="h-4 w-4 text-sky-500" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${isFromMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}
                        >
                          <div
                            className={`px-5 py-3 shadow-sm ${
                              isFromMe
                                ? isFromAI
                                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                                  : "bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl rounded-tr-sm"
                                : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
                            }`}
                          >
                            {isFromAI && (
                              <div className="flex items-center gap-1 mb-1 text-xs text-white/80">
                                <Bot className="h-3 w-3" />
                                <span>AI Assistant</span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.message_text}
                            </p>
                          </div>
                          <span className="text-[10px] mt-1.5 px-1 text-slate-400">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
              {selectedSession.ai_mode && (
                <div className="mb-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <Bot className="h-4 w-4" />
                  <span>AI mode is active. AI will respond to user messages automatically.</span>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-sky-200"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-slate-50/30">
            <div className="h-16 w-16 sm:h-24 sm:w-24 bg-white rounded-full shadow-xl shadow-sky-100 flex items-center justify-center mb-4 sm:mb-6 animate-in zoom-in duration-500">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-sky-500" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2">
              Select a conversation
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-6 sm:mb-8">
              Choose a conversation from the sidebar to start chatting
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
                <div className="relative h-4 w-4">
                  <Image
                    src="/yetti/telegram_logo.png"
                    alt="Telegram"
                    fill
                    className="object-contain"
                  />
                </div>
                Telegram
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
                <div className="relative h-4 w-4">
                  <Image
                    src="/yetti/instagram_logo.png"
                    alt="Instagram"
                    fill
                    className="object-contain"
                  />
                </div>
                Instagram
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
