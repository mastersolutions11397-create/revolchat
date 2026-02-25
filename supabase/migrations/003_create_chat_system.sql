-- Chat System for Telegram Integration
-- This migration creates tables for managing chat sessions and messages

-- Chat Sessions Table
-- Tracks active chat sessions with users (online status, AI mode, platform info)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- External user info (Telegram user)
    external_user_id TEXT NOT NULL, -- Telegram user ID
    external_username TEXT, -- Telegram username
    external_first_name TEXT,
    external_last_name TEXT,
    external_photo_url TEXT,

    -- Platform and session info
    platform TEXT NOT NULL CHECK (platform IN ('telegram', 'instagram', 'whatsapp')),
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'idle', 'closed')),

    -- AI control
    ai_mode BOOLEAN NOT NULL DEFAULT true, -- When true, AI responds; when false, admin takes over
    last_ai_response_at TIMESTAMP WITH TIME ZONE,

    -- Online status
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Unique constraint for external user per platform per workspace
    UNIQUE(workspace_id, platform, external_user_id)
);

-- Chat Messages Table
-- Stores all messages exchanged in chat sessions
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID NOT NULL,

    -- Message content
    message_text TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location', 'sticker')),

    -- Sender info
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'ai')),
    sender_id TEXT, -- External user ID or admin user ID
    sender_name TEXT,

    -- Message metadata
    platform_message_id TEXT, -- Original message ID from Telegram/Instagram
    reply_to_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,

    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Attachments and metadata
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace ON chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_external_user ON chat_sessions(external_user_id, platform);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_online ON chat_sessions(is_online, workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ai_mode ON chat_sessions(ai_mode, workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace ON chat_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
-- Allow workspace owners/admins to view all sessions in their workspace
DROP POLICY IF EXISTS "Users can view sessions in their workspace" ON public.chat_sessions;
CREATE POLICY "Users can view sessions in their workspace" ON public.chat_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_plans
            WHERE user_plans.user_id = auth.uid()
            AND user_plans.workspace_id = chat_sessions.workspace_id
        )
    );

DROP POLICY IF EXISTS "Users can insert sessions in their workspace" ON public.chat_sessions;
CREATE POLICY "Users can insert sessions in their workspace" ON public.chat_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_plans
            WHERE user_plans.user_id = auth.uid()
            AND user_plans.workspace_id = chat_sessions.workspace_id
        )
    );

DROP POLICY IF EXISTS "Users can update sessions in their workspace" ON public.chat_sessions;
CREATE POLICY "Users can update sessions in their workspace" ON public.chat_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_plans
            WHERE user_plans.user_id = auth.uid()
            AND user_plans.workspace_id = chat_sessions.workspace_id
        )
    );

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages in their workspace" ON public.chat_messages;
CREATE POLICY "Users can view messages in their workspace" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND (
                chat_sessions.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_plans
                    WHERE user_plans.user_id = auth.uid()
                    AND user_plans.workspace_id = chat_sessions.workspace_id
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert messages in their workspace" ON public.chat_messages;
CREATE POLICY "Users can insert messages in their workspace" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND (
                chat_sessions.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_plans
                    WHERE user_plans.user_id = auth.uid()
                    AND user_plans.workspace_id = chat_sessions.workspace_id
                )
            )
        )
    );

-- Function to update updated_at timestamp for chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity_at when new message is sent
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions
    SET
        last_activity_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session activity on new message
DROP TRIGGER IF EXISTS update_session_activity_trigger ON public.chat_messages;
CREATE TRIGGER update_session_activity_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Function to mark sessions as offline after inactivity
CREATE OR REPLACE FUNCTION mark_inactive_sessions_offline()
RETURNS void AS $$
BEGIN
    UPDATE public.chat_sessions
    SET
        is_online = false,
        session_status = 'idle',
        updated_at = timezone('utc'::text, now())
    WHERE
        is_online = true
        AND last_activity_at < (timezone('utc'::text, now()) - INTERVAL '5 minutes');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO anon, authenticated;
GRANT ALL ON public.chat_messages TO anon, authenticated;
