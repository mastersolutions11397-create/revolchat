"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useAuth } from "@/lib/auth-context";
import { chatSystemAPI } from "@/lib/api/chat-system";
import { triggerWordsAPI } from "@/lib/api/trigger-words";
import { supabase } from "@/lib/supabase";
import type { ChatMessage, SessionWithLastMessage, TriggerWord } from "@/lib/types/chat";
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
  Zap,
  Image as ImageIcon,
  Video,
  File,
  Music,
} from "lucide-react";
import { toast } from "sonner";

type ChannelType = "telegram" | "instagram";

function getTriggerMediaIcon(type: string) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    case "audio":
      return Music;
    default:
      return File;
  }
}

function renderMessageContent(message: ChatMessage) {
  const attachment = message.attachments?.[0];

  if (message.message_type === "image" && attachment?.url) {
    return (
      <div className="space-y-2">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={attachment.url}
            alt={attachment.filename || "Sent image"}
            fill
            className="object-cover"
          />
        </div>
        {message.message_text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message_text}
          </p>
        ) : null}
      </div>
    );
  }

  if (message.message_type === "video" && attachment?.url) {
    return (
      <div className="space-y-2">
        <video
          src={attachment.url}
          controls
          className="max-h-64 w-full rounded-xl bg-black"
        />
        {message.message_text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message_text}
          </p>
        ) : null}
      </div>
    );
  }

  if ((message.message_type === "audio" || message.message_type === "file") && attachment?.url) {
    return (
      <div className="space-y-2">
        {message.message_type === "audio" ? (
          <audio src={attachment.url} controls className="w-full" />
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm underline-offset-2 hover:underline"
          >
            <File className="h-4 w-4" />
            {attachment.filename || "Open file"}
          </a>
        )}
        {message.message_text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message_text}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {message.message_text}
    </p>
  );
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedSessionRef = useRef<SessionWithLastMessage | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  // Trigger words state
  const [triggerWords, setTriggerWords] = useState<TriggerWord[]>([]);
  const [showTriggerSuggestions, setShowTriggerSuggestions] = useState(false);
  const [selectedTriggerIndex, setSelectedTriggerIndex] = useState(0);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch trigger words
  useEffect(() => {
    const fetchTriggers = async () => {
      if (!user) return;

      try {
        const data = await triggerWordsAPI.getActiveTriggerWords();
        setTriggerWords(data);
      } catch (error) {
        console.error("Error fetching triggers:", error);
      }
    };

    fetchTriggers();
  }, [user]);

  // Filter trigger words based on input
  const filteredTriggers = useMemo(() => {
    if (!messageInput.startsWith("/")) return [];
    const searchTerm = messageInput.slice(1).toLowerCase();
    return triggerWords.filter((t) =>
      t.trigger_word.slice(1).toLowerCase().includes(searchTerm)
    );
  }, [messageInput, triggerWords]);

  // Show/hide trigger suggestions
  useEffect(() => {
    if (messageInput.startsWith("/") && filteredTriggers.length > 0) {
      setShowTriggerSuggestions(true);
      setSelectedTriggerIndex(0);
    } else {
      setShowTriggerSuggestions(false);
    }
  }, [messageInput, filteredTriggers.length]);

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
        async (payload) => {
          const currentSelectedSession = selectedSessionRef.current;

          // If it's an update to the currently selected session, update it directly
          if (payload.eventType === "UPDATE" && payload.new && currentSelectedSession) {
            const updatedSession = payload.new as SessionWithLastMessage;
            if (updatedSession.id === currentSelectedSession.id) {
              setSelectedSession((prev) =>
                prev ? { ...prev, ...updatedSession } : prev
              );
            }
          }

          // Refresh sessions list
          try {
            const data = await chatSystemAPI.getSessions(selectedChannel);
            setSessions(data);

            // Also update selectedSession if it exists in the new data
            if (currentSelectedSession) {
              const updatedSelected = data.find((s) => s.id === currentSelectedSession.id);
              if (updatedSelected) {
                setSelectedSession(updatedSelected);
              }
            }
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

  // Handle selecting a trigger word
  const handleSelectTrigger = async (trigger: TriggerWord) => {
    if (!selectedSession || sending) return;

    setShowTriggerSuggestions(false);
    setSending(true);

    try {
      await chatSystemAPI.sendMessage({
        session_id: selectedSession.id,
        message_text: trigger.description || "",
        message_type: trigger.media_type,
        attachments: [
          {
            type: trigger.media_type,
            url: trigger.media_url,
            filename: trigger.media_filename,
            size: trigger.media_size,
          },
        ],
        sender_type: "admin",
      });

      // Increment usage count
      try {
        await triggerWordsAPI.incrementUsage(trigger.id);
      } catch {
        // Silently fail usage tracking
      }

      setMessageInput("");
      toast.success(`Sent ${trigger.trigger_word}`);
    } catch (error) {
      console.error("Error sending trigger:", error);
      toast.error("Failed to send media");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSession || sending) return;

    // Check if input matches a trigger word exactly
    const exactTrigger = triggerWords.find(
      (t) => t.trigger_word.toLowerCase() === messageInput.toLowerCase()
    );

    if (exactTrigger) {
      await handleSelectTrigger(exactTrigger);
      return;
    }

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

  // Handle keyboard navigation for trigger suggestions
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showTriggerSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedTriggerIndex((prev) =>
          prev < filteredTriggers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedTriggerIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTriggers.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTriggers[selectedTriggerIndex]) {
          handleSelectTrigger(filteredTriggers[selectedTriggerIndex]);
        }
      } else if (e.key === "Escape") {
        setShowTriggerSuggestions(false);
      }
    } else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleToggleAIMode = async () => {
    if (!selectedSession) return;

    const newAiMode = !selectedSession.ai_mode;
    const sessionId = selectedSession.id;
    const originalAiMode = selectedSession.ai_mode;

    console.log("Toggle AI Mode - Before:", { sessionId, currentMode: originalAiMode, newMode: newAiMode });

    // Optimistically update the UI immediately
    setSelectedSession(prev => prev ? { ...prev, ai_mode: newAiMode } : prev);

    // Also update in sessions list for consistency
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, ai_mode: newAiMode } : s
      )
    );

    try {
      const result = await chatSystemAPI.toggleAIMode({
        session_id: sessionId,
        ai_mode: newAiMode,
      });

      console.log("Toggle AI Mode - API Result:", result);

      toast.success(
        newAiMode ? "AI mode enabled" : "Manual mode enabled"
      );
    } catch (error) {
      // Revert on error
      console.error("Toggle AI Mode - Error:", error);
      setSelectedSession(prev => prev ? { ...prev, ai_mode: originalAiMode } : prev);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, ai_mode: originalAiMode } : s
        )
      );
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
                          <span className="flex-shrink-0" title="AI Mode Active">
                            <Bot className="h-3 w-3 text-sky-500" />
                          </span>
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
                  type="button"
                  onClick={() => {
                    alert("AI Toggle clicked! Current mode: " + (selectedSession.ai_mode ? "AI" : "Manual"));
                    handleToggleAIMode();
                  }}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
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
                  {messages.map((message) => {
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
                            {renderMessageContent(message)}
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

              {/* Trigger Words Hint */}
              {triggerWords.length > 0 && !messageInput && (
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-3 w-3" />
                  <span>Type / to see available triggers</span>
                </div>
              )}

              <div className="relative flex gap-2 sm:gap-3">
                {/* Trigger Suggestions Dropdown */}
                {showTriggerSuggestions && filteredTriggers.length > 0 && (
                  <div className="absolute bottom-full left-0 right-16 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Zap className="h-3 w-3 text-teal-primary" />
                        <span>Trigger Words</span>
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredTriggers.map((trigger, index) => {
                        const MediaIcon = getTriggerMediaIcon(trigger.media_type);
                        return (
                          <button
                            key={trigger.id}
                            onClick={() => handleSelectTrigger(trigger)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                              index === selectedTriggerIndex
                                ? "bg-teal-primary/10 text-teal-primary"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              index === selectedTriggerIndex
                                ? "bg-teal-primary/20"
                                : "bg-slate-100"
                            }`}>
                              <MediaIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {trigger.trigger_word}
                              </p>
                              {trigger.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {trigger.description}
                                </p>
                              )}
                            </div>
                            {trigger.media_type === "image" && (
                              <div className="relative h-8 w-8 rounded overflow-hidden bg-slate-100 shrink-0">
                                <Image
                                  src={trigger.media_url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <p className="text-[10px] text-slate-400 text-center">
                        Use ↑↓ to navigate, Enter to select, Esc to close
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type your message or / for triggers..."
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
