-- Add bot_id to chat_sessions to properly scope conversations per bot
-- This fixes the issue where a single user messaging multiple bots gets confused

-- Add bot_id column
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Drop the old unique constraint that didn't include bot_id
ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_workspace_id_platform_external_user_id_key;

-- Create new unique constraint that includes bot_id
-- This ensures each user can have separate sessions with different bots
ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_unique_per_bot
  UNIQUE NULLS NOT DISTINCT (platform, external_user_id, bot_id);

-- Index for efficient bot filtering in inbox
CREATE INDEX IF NOT EXISTS idx_chat_sessions_bot_id ON public.chat_sessions(bot_id);
