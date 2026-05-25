"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { type Conversation, type Message } from "@/lib/api/integrations";
import { MessageSquare, Search, Info, ArrowLeft, Send, Bot, User, Zap, Image as ImageIcon, Video, File, Music, ChevronDown, Trash2, Loader2, Paperclip, X, Globe2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Attachment, ChatSession, ChatMessage, MessageType, TriggerWord } from "@/lib/types/chat";
import { chatSystemAPI } from "@/lib/api/chat-system";
import { triggerWordsAPI } from "@/lib/api/trigger-words";
import { agentsAPI, type Agent } from "@/lib/api/agents";
import { useWorkspace } from "@/lib/workspace-context";
import { toast } from "sonner";

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

type ChannelType = "telegram" | "web";
const MAX_MEDIA_SIZE_MB = 20;
const MAX_DOCUMENT_SIZE_MB = 5;

const CHANNELS: Array<{ id: ChannelType; label: string; shortLabel: string }> = [
  { id: "telegram", label: "Telegram", shortLabel: "TG" },
  { id: "web", label: "Web page", shortLabel: "Web" },
];

interface SessionWithLastMessage extends ChatSession {
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

type InboxMessage = Message & Pick<ChatMessage, "message_type" | "attachments">;

function getChannelLabel(channel: ChannelType) {
  return CHANNELS.find((item) => item.id === channel)?.label ?? channel;
}

function isValidUuid(value?: string) {
  return Boolean(
    value &&
      value !== "undefined" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
      )
  );
}

function ChannelIcon({
  channel,
  className = "h-4 w-4",
}: {
  channel: ChannelType;
  className?: string;
}) {
  if (channel === "telegram") {
    return (
      <Image
        src="/yetti/telegram_logo.png"
        alt="Telegram"
        width={20}
        height={20}
        className={className}
      />
    );
  }

  if (channel === "web") {
    return <Globe2 className={className} />;
  }

  return <MessageSquare className={className} />;
}

// Helper to check if user is online (active in last 5 minutes)
const isUserOnline = (lastSeenAt?: string): boolean => {
  if (!lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
  return diffMinutes < 5; // Consider online if active in last 5 minutes
};

// Transform chat sessions to Conversation format
const transformSessionsToConversations = (
  sessions: SessionWithLastMessage[]
): Conversation[] => {
  return sessions.filter((session) => isValidUuid(session.id)).map((session) => ({
    id: session.id,
    participant_id: session.external_user_id,
    participant_name:
      session.external_first_name ||
      session.external_username ||
      `User ${session.external_user_id.slice(0, 6)}`,
    participant_avatar: session.external_photo_url,
    last_message: session.last_message || "",
    last_message_time: session.last_message_time || session.last_activity_at,
    unread_count: session.unread_count || 0,
    // Calculate online status based on last_seen_at
    is_online: isUserOnline(session.last_seen_at),
    ai_mode: session.ai_mode,
  }));
};

// Transform chat messages to Message format
const transformMessagesToMessages = (
  chatMessages: ChatMessage[]
): InboxMessage[] => {
  return chatMessages.map((msg) => ({
    id: msg.id,
    text: msg.message_text,
    sender_id: msg.sender_type === "ai" || msg.sender_type === "admin" ? "agent" : msg.session_id,
    sender_name: msg.sender_type === "user" ? "User" : "Agent",
    timestamp: msg.created_at,
    is_from_me: msg.sender_type === "ai" || msg.sender_type === "admin",
    message_type: msg.message_type,
    attachments: msg.attachments,
  }));
};

const appendUniqueInboxMessage = (
  currentMessages: InboxMessage[],
  nextMessage: InboxMessage
): InboxMessage[] => {
  if (currentMessages.some((message) => message.id === nextMessage.id)) {
    return currentMessages;
  }

  return [...currentMessages, nextMessage];
};

function renderInboxMessageContent(message: InboxMessage) {
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
        {message.text ? (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
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
        {message.text ? (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
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
            className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-xs sm:text-sm underline-offset-2 hover:underline"
          >
            <File className="h-4 w-4" />
            {attachment.filename || "Open file"}
          </a>
        )}
        {message.text ? (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
      {message.text}
    </p>
  );
}

export default function InboxPage() {
  const { t } = useLanguage();
  const { activeWorkspace } = useWorkspace();

  const [selectedChannel, setSelectedChannel] =
    useState<ChannelType>("telegram");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChatView, setShowChatView] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    type: MessageType;
  } | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Trigger words state
  const [triggerWords, setTriggerWords] = useState<TriggerWord[]>([]);
  const [showTriggerSuggestions, setShowTriggerSuggestions] = useState(false);
  const [selectedTriggerIndex, setSelectedTriggerIndex] = useState(0);

  // Bot selector state
  const [bots, setBots] = useState<Agent[]>([]);
  const [selectedBot, setSelectedBot] = useState<Agent | null>(null);
  const [showBotDropdown, setShowBotDropdown] = useState(false);

  // Fetch bots on mount
  useEffect(() => {
    const fetchBots = async () => {
      try {
        if (!activeWorkspace) {
          setBots([]);
          setSelectedBot(null);
          return;
        }
        const response = await agentsAPI.list(activeWorkspace.id);
        const validAgents = response.agents.filter((agent) =>
          isValidUuid(agent.id)
        );
        setBots(validAgents);

        if (validAgents.length === 0) {
          setSelectedBot(null);
          return;
        }

        if (
          !selectedBot ||
          !validAgents.some((agent) => agent.id === selectedBot.id)
        ) {
          setSelectedBot(validAgents[0]);
        }
      } catch (error) {
        console.error("Error fetching bots:", error);
      }
    };

    fetchBots();
  }, [activeWorkspace, selectedBot]);

  // Function to load conversations (extracted so it can be called from multiple places)
  const loadConversations = useCallback(async () => {
      if (!selectedBot || !activeWorkspace) {
        setConversations([]);
        setSelectedConversation(null);
        return;
      }

      const workspaceId = isValidUuid(activeWorkspace.id)
        ? activeWorkspace.id
        : isValidUuid(selectedBot?.workspace_id ?? undefined)
          ? selectedBot?.workspace_id ?? undefined
          : undefined;

      if (!workspaceId) {
        setConversations([]);
        setSelectedConversation(null);
        toast.error("A valid workspace is required.");
        return;
      }

      if (!isValidUuid(selectedBot.id)) {
        setConversations([]);
        setSelectedConversation(null);
        toast.error("Please select a valid bot.");
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching sessions for channel:", selectedChannel, "workspace:", workspaceId, "bot:", selectedBot.id);

        const sessions = await chatSystemAPI.getSessions(
          selectedChannel,
          workspaceId,
          selectedBot.id
        );
        const data = transformSessionsToConversations(sessions);
        console.log("Transformed conversations:", data);
        setConversations(data);
        setSelectedConversation((current) =>
          current && data.some((conversation) => conversation.id === current.id)
            ? current
            : data[0] ?? null
        );
      } catch (err: unknown) {
        console.error("Error loading conversations:", err);
        toast.error(err instanceof Error ? err.message : "Failed to load conversations");
        setConversations([]);
        setSelectedConversation(null);
      } finally {
        setLoading(false);
      }
  }, [activeWorkspace, selectedBot, selectedChannel]);

  // Fetch trigger words for selected bot
  useEffect(() => {
    const fetchTriggers = async () => {
      if (!selectedBot || !isValidUuid(selectedBot.id)) {
        setTriggerWords([]);
        return;
      }
      try {
        const data = await triggerWordsAPI.getActiveTriggerWords(selectedBot.id);
        setTriggerWords(data);
      } catch (error) {
        console.error("Error fetching triggers:", error);
      }
    };

    fetchTriggers();
  }, [selectedBot]);

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

  // Load conversations when channel or bot changes
  useEffect(() => {
    // Clear selected conversation when switching bots
    setSelectedConversation(null);
    setMessages([]);
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      if (!isValidUuid(selectedConversation.id)) {
        setMessages([]);
        return;
      }

      setLoading(true);
      try {
        const chatMessages = await chatSystemAPI.getMessages(selectedConversation.id);
        const data = transformMessagesToMessages(chatMessages);
        setMessages(data);

        // Scroll to bottom after messages load
        setTimeout(() => scrollToBottom(), 100);

        await chatSystemAPI.markMessagesAsRead(selectedConversation.id);
      } catch (err: unknown) {
        console.error("Error loading messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation, loadConversations]);

  // Real-time subscription for new messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`inbox_messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          const formattedMessage = transformMessagesToMessages([newMessage])[0];
          setMessages((prev) =>
            appendUniqueInboxMessage(prev, formattedMessage)
          );

          // Update conversation list with new last message (without full reload)
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversation.id
                ? {
                    ...c,
                    last_message: newMessage.message_text,
                    last_message_time: newMessage.created_at,
                    unread_count: newMessage.sender_type === "user" ? (c.unread_count || 0) + 1 : c.unread_count,
                  }
                : c
            )
          );

          // Scroll to bottom for new messages
          setTimeout(() => scrollToBottom(), 100);

          // Mark as read if from user (since we're viewing this conversation)
          if (newMessage.sender_type === "user") {
            supabase
              .from("chat_messages")
              .update({ is_read: true })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, loadConversations]);

  // Real-time subscription for ALL new messages (to update sidebar)
  useEffect(() => {
    const channel = supabase
      .channel("inbox_all_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          const sessionId = newMessage.session_id;

          // Skip if this is the currently selected conversation (already handled above)
          if (selectedConversation?.id === sessionId) return;

          // Update conversation in sidebar without full reload
          setConversations((prev) => {
            const existingConv = prev.find((c) => c.id === sessionId);
            if (existingConv) {
              // Update existing conversation
              return prev.map((c) =>
                c.id === sessionId
                  ? {
                      ...c,
                      last_message: newMessage.message_text,
                      last_message_time: newMessage.created_at,
                      unread_count: newMessage.sender_type === "user" ? (c.unread_count || 0) + 1 : c.unread_count,
                    }
                  : c
              );
            }
            // New conversation - reload to get full details
            loadConversations();
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, loadConversations]);

  // Real-time subscription for new sessions and presence updates
  useEffect(() => {
    if (!selectedBot || !isValidUuid(selectedBot.id)) return;

    const channel = supabase
      .channel(`inbox_sessions:${selectedBot.id}:${selectedChannel}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
          filter: `platform=eq.${selectedChannel}`,
        },
        (payload) => {
          const newSession = payload.new as { bot_id?: string };
          if (newSession.bot_id === selectedBot.id) {
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel, selectedBot, loadConversations]);

  // Toggle AI mode for a session
  const handleToggleAI = async () => {
    if (!selectedConversation) return;

    const newAiMode = !selectedConversation.ai_mode;
    const conversationId = selectedConversation.id;

    // Optimistically update UI immediately
    setSelectedConversation(prev => prev ? { ...prev, ai_mode: newAiMode } : prev);
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, ai_mode: newAiMode } : c)
    );

    try {
      // Update AI mode in database
      const { error } = await supabase
        .from("chat_sessions")
        .update({ ai_mode: newAiMode })
        .eq("id", conversationId);

      if (error) {
        console.error("Error toggling AI mode:", error);
        // Revert on error
        setSelectedConversation(prev => prev ? { ...prev, ai_mode: !newAiMode } : prev);
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, ai_mode: !newAiMode } : c)
        );
        return;
      }
    } catch (error) {
      console.error("Error toggling AI mode:", error);
      // Revert on error
      setSelectedConversation(prev => prev ? { ...prev, ai_mode: !newAiMode } : prev);
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, ai_mode: !newAiMode } : c)
      );
    }
  };

  // Handle selecting a trigger word
  const handleSelectTrigger = async (trigger: TriggerWord) => {
    if (!selectedConversation || sending) return;

    setShowTriggerSuggestions(false);
    setSending(true);

    try {
      const newMessage = await chatSystemAPI.sendMessage({
        session_id: selectedConversation.id,
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

      const formattedMessage = transformMessagesToMessages([newMessage])[0];
      setMessages((prev) => appendUniqueInboxMessage(prev, formattedMessage));

      // Increment usage count
      try {
        await triggerWordsAPI.incrementUsage(trigger.id);
      } catch {
        // Silently fail usage tracking
      }

      setMessageInput("");
    } catch (error) {
      console.error("Error sending trigger:", error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextType: MessageType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "file";

    const maxSizeBytes =
      nextType === "file"
        ? MAX_DOCUMENT_SIZE_MB * 1024 * 1024
        : MAX_MEDIA_SIZE_MB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(
        nextType === "file"
          ? `Document size must be ${MAX_DOCUMENT_SIZE_MB} MB or less`
          : `Media size must be ${MAX_MEDIA_SIZE_MB} MB or less`
      );
      e.target.value = "";
      return;
    }

    setPendingAttachment({ file, type: nextType });
  };

  const clearPendingAttachment = () => {
    setPendingAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send manual message as admin
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !pendingAttachment) || !selectedConversation || sending) return;
    if (!isValidUuid(selectedConversation.id)) {
      toast.error("Please select the web conversation again.");
      setSelectedConversation(null);
      setShowChatView(false);
      return;
    }

    // Check if input matches a trigger word exactly
    const exactTrigger = pendingAttachment
      ? undefined
      : triggerWords.find(
          (t) => t.trigger_word.toLowerCase() === messageInput.toLowerCase()
        );

    if (exactTrigger) {
      await handleSelectTrigger(exactTrigger);
      return;
    }

    setSending(true);
    try {
      let attachments: Attachment[] | undefined;
      let messageType: MessageType | undefined;

      if (pendingAttachment) {
        const uploadResult = await chatSystemAPI.uploadAttachment(pendingAttachment.file);
        messageType = uploadResult.message_type;
        attachments = [
          {
            type: uploadResult.message_type,
            url: uploadResult.url,
            filename: uploadResult.filename,
            size: uploadResult.size,
            mime_type: uploadResult.mime_type,
          },
        ];
      }

      const newMessage = await chatSystemAPI.sendMessage({
        session_id: selectedConversation.id,
        message_text: messageInput.trim(),
        message_type: messageType,
        attachments,
        sender_type: "admin",
      });

      const formattedMessage = transformMessagesToMessages([newMessage])[0];
      setMessages((prev) => appendUniqueInboxMessage(prev, formattedMessage));

      setMessageInput("");
      clearPendingAttachment();
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setSending(false);
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

  const handleDeleteConversation = async (conversation: Conversation) => {
    if (deletingConversationId || deletingAll) return;

    toast.warning(`Delete conversation with ${conversation.participant_name}?`, {
      description: "This action cannot be undone.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingConversationId(conversation.id);

          try {
            await chatSystemAPI.deleteSession(conversation.id);

            const nextConversations = conversations.filter((c) => c.id !== conversation.id);
            setConversations(nextConversations);

            if (selectedConversation?.id === conversation.id) {
              const nextSelected = nextConversations[0] ?? null;
              setSelectedConversation(nextSelected);
              setMessages([]);
              if (!nextSelected) {
                setShowChatView(false);
              }
            }

            toast.success("Conversation deleted");
          } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error(
              error instanceof Error ? error.message : "Failed to delete conversation."
            );
          } finally {
            setDeletingConversationId(null);
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
  };

  const handleDeleteAllConversations = async () => {
    if (!selectedBot || deletingAll || deletingConversationId) return;
    if (conversations.length === 0) return;

    toast.warning(`Delete all conversations for ${selectedBot.name}?`, {
      description: `This will remove all ${getChannelLabel(selectedChannel)} conversations for this bot and cannot be undone.`,
      duration: 10000,
      action: {
        label: "Delete all",
        onClick: async () => {
          setDeletingAll(true);

          try {
            const deletedCount = await chatSystemAPI.deleteAllSessions({
              platform: selectedChannel,
              bot_id: selectedBot.id,
            });

            setConversations([]);
            setSelectedConversation(null);
            setMessages([]);
            setShowChatView(false);

            toast.success(
              deletedCount === 1
                ? "1 conversation deleted"
                : `${deletedCount} conversations deleted`
            );
          } catch (error) {
            console.error("Error deleting all conversations:", error);
            toast.error(
              error instanceof Error ? error.message : "Failed to delete conversations."
            );
          } finally {
            setDeletingAll(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Bulk deletion cancelled");
        },
      },
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showBotDropdown && !target.closest("[data-bot-dropdown]")) {
        setShowBotDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBotDropdown]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-card shadow-xl">
      {/* Sidebar - Channel Selection & Conversations */}
      <div
        className={`${showChatView ? "hidden md:flex" : "flex"} w-full md:w-80 flex flex-col border-r border-dashboard-border bg-dashboard-bg`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-dashboard-border bg-dashboard-card">
          <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t("inbox.chat")}
            </h2>
            <button
              type="button"
              onClick={handleDeleteAllConversations}
              disabled={!selectedBot || conversations.length === 0 || deletingAll || !!deletingConversationId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete all conversations"
            >
              {deletingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Delete all</span>
            </button>
          </div>

          {/* Bot Selector Dropdown */}
          <div className="relative" data-bot-dropdown>
            <button
              onClick={() => setShowBotDropdown(!showBotDropdown)}
              className="w-full flex items-center justify-between gap-2 p-2.5 bg-dashboard-bg border border-dashboard-border rounded-xl text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-primary">
                  <ChannelIcon channel={selectedChannel} className="h-4 w-4" />
                </div>
                <span className="truncate">
                  {selectedBot?.telegram_first_name || selectedBot?.name || "Select a bot"}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${showBotDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown menu */}
            {showBotDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dashboard-border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                {bots.length === 0 ? (
                  <div className="p-3 text-center text-sm text-slate-500">
                    No bots configured
                  </div>
                ) : (
                  bots.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => {
                        setSelectedBot(bot);
                        setShowBotDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                        selectedBot?.id === bot.id ? "bg-teal-50 text-teal-700" : "text-slate-700"
                      }`}
                    >
                      <div className="relative h-6 w-6 flex-shrink-0 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center">
                        {bot.profile_picture_url ? (
                          <Image
                            src={bot.profile_picture_url}
                            alt={bot.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-teal-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{bot.telegram_first_name || bot.name}</p>
                        {bot.telegram_username && (
                          <p className="text-xs text-slate-400 truncate">@{bot.telegram_username}</p>
                        )}
                      </div>
                      {selectedBot?.id === bot.id && (
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-dashboard-border bg-dashboard-bg p-1">
            {CHANNELS.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSelectedChannel(channel.id)}
                className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                  selectedChannel === channel.id
                    ? "bg-white text-teal-primary shadow-sm"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                <ChannelIcon channel={channel.id} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{channel.shortLabel}</span>
              </button>
            ))}
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
          {!selectedBot ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 p-4 text-center">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
              <p className="text-slate-500 text-xs sm:text-sm">Select a bot to view conversations</p>
            </div>
          ) : loading && conversations.length === 0 ? (
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
                <div
                  key={conversation.id}
                  className={`group w-full p-3 sm:p-4 hover:bg-dashboard-card transition-all duration-200 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-dashboard-card border-l-4 border-teal-primary shadow-sm"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleConversationSelect(conversation)}
                      className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3 text-left"
                    >
                      <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-xl overflow-hidden bg-teal-primary/10 flex items-center justify-center text-teal-primary shadow-sm">
                        <ChannelIcon channel={selectedChannel} className="h-5 w-5 sm:h-6 sm:w-6" />
                        {/* Online indicator - green dot */}
                        {conversation.is_online && (
                          <div className="absolute top-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                        <div className="absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-full p-0.5">
                          <ChannelIcon channel={selectedChannel} className="h-full w-full" />
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
                    </button>
                    <div className="flex items-center gap-1 ml-1 sm:ml-2">
                      {(conversation.unread_count ?? 0) > 0 && (
                          <div className="flex flex-col justify-center h-full">
                            <span className="flex items-center justify-center h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] px-1 sm:px-1.5 text-[10px] font-bold text-white bg-teal-primary rounded-full shadow-sm shadow-teal-primary/20">
                              {conversation.unread_count}
                            </span>
                          </div>
                        )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteConversation(conversation)}
                        disabled={deletingAll || deletingConversationId === conversation.id}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete conversation"
                      >
                        {deletingConversationId === conversation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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

                <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-xl overflow-hidden bg-teal-primary/10 flex items-center justify-center text-teal-primary shadow-sm">
                  <ChannelIcon channel={selectedChannel} className="h-4 w-4 sm:h-5 sm:w-5" />
                  {/* Online indicator in header */}
                  {selectedConversation.is_online && (
                    <div className="absolute top-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                    <span className="truncate">
                      {selectedConversation.participant_name}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider flex-shrink-0 bg-teal-primary/10 text-teal-primary border border-teal-primary/20">
                      {getChannelLabel(selectedChannel)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                    {selectedConversation.is_online && (
                      <>
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>Online</span>
                      </>
                    )}
                    {!selectedConversation.is_online && (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => void handleDeleteConversation(selectedConversation)}
                  disabled={deletingAll || deletingConversationId === selectedConversation.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete conversation"
                >
                  {deletingConversationId === selectedConversation.id ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
                {/* AI Mode Toggle */}
                <button
                  onClick={handleToggleAI}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedConversation.ai_mode
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                      : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                  }`}
                  title={selectedConversation.ai_mode ? "AI Mode ON - Click to take over manually" : "Manual Mode ON - Click to enable AI"}
                >
                  {selectedConversation.ai_mode ? (
                    <>
                      <Bot className="h-4 w-4" />
                      <span className="hidden sm:inline">AI</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Manual</span>
                    </>
                  )}
                </button>
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
                          {renderInboxMessageContent(message)}
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
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="border-t border-dashboard-border bg-dashboard-card/80 backdrop-blur-sm p-4">
              {/* Trigger Words Hint */}
              {triggerWords.length > 0 && !messageInput && !selectedConversation.ai_mode ? (
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-3 w-3" />
                  <span>Type / to see available triggers</span>
                </div>
              ) : null}

              {pendingAttachment && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                      <File className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {pendingAttachment.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB
                        {pendingAttachment.type === "file"
                          ? ` / ${MAX_DOCUMENT_SIZE_MB} MB max`
                          : ` / ${MAX_MEDIA_SIZE_MB} MB max`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearPendingAttachment}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                    title="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3 relative">
                {/* Trigger Suggestions Dropdown */}
                {showTriggerSuggestions && filteredTriggers.length > 0 ? (
                  <div className="absolute bottom-full left-0 right-16 mb-2 bg-white border border-dashboard-border rounded-xl shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
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
                ) : null}

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleSelectAttachment}
                  accept=".pdf,.doc,.docx,.txt,image/*,video/*,audio/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedConversation.ai_mode || sending}
                  className="p-3 border border-dashboard-border bg-dashboard-bg text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
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
                      } else if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={selectedConversation.ai_mode ? "AI is responding..." : "Type your message..."}
                    disabled={selectedConversation.ai_mode || sending}
                    className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={2}
                  />
                  {selectedConversation.ai_mode && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Bot className="h-3 w-3" />
                      AI mode is ON. Disable AI mode to send manual messages.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={(!messageInput.trim() && !pendingAttachment) || sending || selectedConversation.ai_mode}
                  className="p-3 bg-teal-primary text-white rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
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
                <div className="flex h-3 w-3 items-center justify-center text-teal-primary sm:h-4 sm:w-4">
                  <ChannelIcon channel={selectedChannel} className="h-full w-full" />
                </div>
                <span className="hidden sm:inline">{getChannelLabel(selectedChannel)}</span>
                <span className="sm:hidden">{CHANNELS.find((channel) => channel.id === selectedChannel)?.shortLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
