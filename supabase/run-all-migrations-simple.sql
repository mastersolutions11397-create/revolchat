-- ============================================================
-- Telegram Chat System Setup (Simplified - No Workspaces)
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Step 1: Create Chat System Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- External user info (Telegram user)
    external_user_id TEXT NOT NULL,
    external_username TEXT,
    external_first_name TEXT,
    external_last_name TEXT,
    external_photo_url TEXT,

    -- Platform and session info
    platform TEXT NOT NULL CHECK (platform IN ('telegram', 'instagram', 'whatsapp')),
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'idle', 'closed')),

    -- AI control
    ai_mode BOOLEAN NOT NULL DEFAULT true,
    last_ai_response_at TIMESTAMP WITH TIME ZONE,

    -- Online status
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(platform, external_user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,

    -- Message content
    message_text TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location', 'sticker')),

    -- Sender info
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'ai')),
    sender_id TEXT,
    sender_name TEXT,

    -- Message metadata
    platform_message_id TEXT,
    reply_to_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,

    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Attachments and metadata
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Create Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_external_user ON chat_sessions(external_user_id, platform);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_online ON chat_sessions(is_online);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ai_mode ON chat_sessions(ai_mode);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Step 3: Enable RLS
-- ============================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies (Allow authenticated users to access all)
-- ============================================================

-- Chat Sessions Policies
DROP POLICY IF EXISTS "Authenticated users can view all sessions" ON public.chat_sessions;
CREATE POLICY "Authenticated users can view all sessions" ON public.chat_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON public.chat_sessions;
CREATE POLICY "Authenticated users can insert sessions" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update sessions" ON public.chat_sessions;
CREATE POLICY "Authenticated users can update sessions" ON public.chat_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Chat Messages Policies
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can view all messages" ON public.chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 5: Create Functions and Triggers
-- ============================================================

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_sessions updated_at
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

-- Step 6: Grant Permissions
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO anon, authenticated;
GRANT ALL ON public.chat_messages TO anon, authenticated;

-- ============================================================
-- Migration Complete!
-- ============================================================
-- Next steps:
-- 1. Enable Realtime for chat_sessions and chat_messages tables
-- 2. Set up your Telegram bot token in .env: TELEGRAM_BOT_TOKEN
-- 3. Start your app and test!
-- ============================================================
