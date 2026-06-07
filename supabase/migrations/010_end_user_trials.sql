-- Migration 010: End-user trial and subscription system

-- 1. Add subscription columns to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS subscription_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS end_user_price_cents INTEGER NOT NULL DEFAULT 999,
ADD COLUMN IF NOT EXISTS trial_days           INTEGER NOT NULL DEFAULT 30;

-- 2. Create end_user_trials table
CREATE TABLE IF NOT EXISTS public.end_user_trials (
    id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id                     UUID        NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    platform                   TEXT        NOT NULL CHECK (platform IN ('telegram', 'instagram', 'whatsapp')),
    platform_user_id           TEXT        NOT NULL,
    trial_start_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_at               TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    status                     TEXT        NOT NULL DEFAULT 'active'
                                               CHECK (status IN ('active', 'expired', 'subscribed', 'cancelled')),
    stripe_checkout_url        TEXT,
    stripe_checkout_session_id TEXT,
    stripe_checkout_expires_at TIMESTAMPTZ,
    stripe_customer_id         TEXT,
    stripe_subscription_id     TEXT,
    admin_notified_at          TIMESTAMPTZ,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bot_id, platform, platform_user_id)
);

CREATE INDEX IF NOT EXISTS end_user_trials_bot_id_idx
    ON public.end_user_trials (bot_id);
CREATE INDEX IF NOT EXISTS end_user_trials_status_idx
    ON public.end_user_trials (status);
CREATE INDEX IF NOT EXISTS end_user_trials_bot_platform_idx
    ON public.end_user_trials (bot_id, platform, platform_user_id);

CREATE OR REPLACE FUNCTION public.set_end_user_trials_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS end_user_trials_updated_at ON public.end_user_trials;
CREATE TRIGGER end_user_trials_updated_at
    BEFORE UPDATE ON public.end_user_trials
    FOR EACH ROW EXECUTE PROCEDURE public.set_end_user_trials_updated_at();

-- 3. Create CRM notification table
CREATE TABLE IF NOT EXISTS public.end_user_trial_notifications (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_id          UUID        NOT NULL REFERENCES public.end_user_trials(id) ON DELETE CASCADE,
    bot_id            UUID        NOT NULL,
    bot_name          TEXT        NOT NULL,
    admin_user_id     TEXT        NOT NULL,
    platform          TEXT        NOT NULL,
    platform_user_id  TEXT        NOT NULL,
    notification_type TEXT        NOT NULL CHECK (notification_type IN ('trial_expired', 'subscribed')),
    read_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifs_admin_user_idx
    ON public.end_user_trial_notifications (admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifs_bot_id_idx
    ON public.end_user_trial_notifications (bot_id);
CREATE INDEX IF NOT EXISTS notifs_trial_id_idx
    ON public.end_user_trial_notifications (trial_id);
