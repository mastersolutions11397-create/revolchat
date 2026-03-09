-- Trigger Words System
-- This migration creates tables for managing trigger words with media attachments

-- Trigger Words Table
-- Stores trigger words (like /office-pic) linked to media files
-- Note: user_id references admins table (not auth.users) since this app uses custom admin auth
CREATE TABLE IF NOT EXISTS public.trigger_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- References admins.id (no FK constraint for flexibility)

    -- Trigger word info
    trigger_word TEXT NOT NULL, -- e.g., "/office-pic", "/menu", "/price-list"
    description TEXT, -- Optional description of what this trigger does

    -- Media info
    media_url TEXT NOT NULL, -- URL of the media file
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'file', 'audio')),
    media_filename TEXT, -- Original filename
    media_size INTEGER, -- File size in bytes

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0, -- Track how many times this trigger was used

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Unique constraint: one trigger word per user
    UNIQUE(user_id, trigger_word)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trigger_words_user ON trigger_words(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_words_trigger ON trigger_words(trigger_word);
CREATE INDEX IF NOT EXISTS idx_trigger_words_active ON trigger_words(user_id, is_active);

-- Note: RLS is disabled for trigger_words since we use service role key
-- and handle authorization in the API routes via admin cookie verification
-- If you want to enable RLS in the future, uncomment and adjust the policies below

-- ALTER TABLE public.trigger_words ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for service role" ON public.trigger_words FOR ALL USING (true);

-- Function to update updated_at timestamp
DROP TRIGGER IF EXISTS update_trigger_words_updated_at ON public.trigger_words;
CREATE TRIGGER update_trigger_words_updated_at BEFORE UPDATE ON public.trigger_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_trigger_word_usage(trigger_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.trigger_words
    SET
        usage_count = usage_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = trigger_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON public.trigger_words TO anon, authenticated;

-- Create storage bucket for trigger media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'trigger-media',
    'trigger-media',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for trigger-media bucket
-- Drop existing policies first to make migration idempotent
DROP POLICY IF EXISTS "Users can upload trigger media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their trigger media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their trigger media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for trigger media" ON storage.objects;

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload trigger media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'trigger-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their trigger media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'trigger-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their trigger media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'trigger-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to trigger media (since bucket is public)
CREATE POLICY "Public read access for trigger media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'trigger-media');
