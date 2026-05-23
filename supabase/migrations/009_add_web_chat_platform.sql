-- Add embeddable web chat as a supported chat platform.

ALTER TABLE public.chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_platform_check;

ALTER TABLE public.chat_sessions
  ADD CONSTRAINT chat_sessions_platform_check
  CHECK (platform IN ('telegram', 'instagram', 'whatsapp', 'web'));

