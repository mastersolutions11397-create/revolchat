-- Add anon access policies for chat system
-- Run this in Supabase SQL Editor

-- Allow anonymous/public users to read sessions
DROP POLICY IF EXISTS "Allow anon to view sessions" ON public.chat_sessions;
CREATE POLICY "Allow anon to view sessions" ON public.chat_sessions
    FOR SELECT USING (true);

-- Allow anonymous/public users to read messages
DROP POLICY IF EXISTS "Allow anon to view messages" ON public.chat_messages;
CREATE POLICY "Allow anon to view messages" ON public.chat_messages
    FOR SELECT USING (true);

-- Allow anonymous users to update messages (for marking as read)
DROP POLICY IF EXISTS "Allow anon to update messages" ON public.chat_messages;
CREATE POLICY "Allow anon to update messages" ON public.chat_messages
    FOR UPDATE USING (true);

-- Allow anonymous users to insert messages (for sending admin messages)
DROP POLICY IF EXISTS "Allow anon to insert messages" ON public.chat_messages;
CREATE POLICY "Allow anon to insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update sessions (for toggling AI mode)
DROP POLICY IF EXISTS "Allow anon to update sessions" ON public.chat_sessions;
CREATE POLICY "Allow anon to update sessions" ON public.chat_sessions
    FOR UPDATE USING (true);
