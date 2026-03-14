-- Add bot ownership to trigger words so each trigger can belong to a specific bot.

ALTER TABLE public.trigger_words
ADD COLUMN IF NOT EXISTS bot_id UUID;

CREATE INDEX IF NOT EXISTS idx_trigger_words_bot_id
ON public.trigger_words(bot_id);

CREATE INDEX IF NOT EXISTS idx_trigger_words_user_bot_active
ON public.trigger_words(user_id, bot_id, is_active);

ALTER TABLE public.trigger_words
DROP CONSTRAINT IF EXISTS trigger_words_user_id_trigger_word_key;

ALTER TABLE public.trigger_words
ADD CONSTRAINT trigger_words_user_id_bot_id_trigger_word_key
UNIQUE NULLS NOT DISTINCT (user_id, bot_id, trigger_word);
