// Chat System Types

export type Platform = 'telegram' | 'instagram' | 'whatsapp';
export type SessionStatus = 'active' | 'idle' | 'closed';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker';
export type SenderType = 'user' | 'admin' | 'ai';

export interface ChatSession {
  id: string;
  workspace_id: string;
  user_id: string | null;
  bot_id?: string | null;

  // External user info (Telegram user)
  external_user_id: string;
  external_username?: string;
  external_first_name?: string;
  external_last_name?: string;
  external_photo_url?: string;

  // Platform and session info
  platform: Platform;
  session_status: SessionStatus;

  // AI control
  ai_mode: boolean;
  last_ai_response_at?: string;

  // Online status
  is_online: boolean;
  last_seen_at?: string;
  last_activity_at: string;

  // Metadata
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;

  // Computed fields
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  workspace_id: string;

  // Message content
  message_text: string;
  message_type: MessageType;

  // Sender info
  sender_type: SenderType;
  sender_id?: string;
  sender_name?: string;

  // Message metadata
  platform_message_id?: string;
  reply_to_message_id?: string;

  // Status
  is_read: boolean;
  read_at?: string;

  // Attachments and metadata
  attachments: Attachment[];
  metadata: Record<string, unknown>;

  created_at: string;
}

export interface Attachment {
  type: MessageType;
  url: string;
  filename?: string;
  size?: number;
  thumbnail_url?: string;
  mime_type?: string;
}

export interface CreateSessionParams {
  workspace_id: string;
  bot_id?: string;
  external_user_id: string;
  external_username?: string;
  external_first_name?: string;
  external_last_name?: string;
  external_photo_url?: string;
  platform: Platform;
}

export interface CreateMessageParams {
  session_id: string;
  workspace_id: string;
  message_text: string;
  message_type?: MessageType;
  sender_type: SenderType;
  sender_id?: string;
  sender_name?: string;
  platform_message_id?: string;
  reply_to_message_id?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSessionParams {
  ai_mode?: boolean;
  is_online?: boolean;
  session_status?: SessionStatus;
  last_seen_at?: string;
  metadata?: Record<string, unknown>;
}

export interface TelegramWebhookUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      file_size: number;
      width: number;
      height: number;
    }>;
    document?: {
      file_id: string;
      file_unique_id: string;
      file_name?: string;
      mime_type?: string;
      file_size?: number;
    };
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SessionWithLastMessage extends ChatSession {
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

// Trigger Words Types
export type TriggerMediaType = 'image' | 'video' | 'file' | 'audio';

export interface TriggerWord {
  id: string;
  user_id: string;
  bot_id?: string | null;
  trigger_word: string;
  description?: string;
  media_url: string;
  media_type: TriggerMediaType;
  media_filename?: string;
  media_size?: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTriggerWordParams {
  bot_id: string;
  trigger_word: string;
  description?: string;
  media_url: string;
  media_type: TriggerMediaType;
  media_filename?: string;
  media_size?: number;
}

export interface UpdateTriggerWordParams {
  bot_id?: string;
  trigger_word?: string;
  description?: string;
  media_url?: string;
  media_type?: TriggerMediaType;
  media_filename?: string;
  media_size?: number;
  is_active?: boolean;
}
