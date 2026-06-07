# End-User Trial & Subscription System — Design Document

**Date:** 2026-06-07  
**Status:** Approved  
**Repos:** `yetti-clone` (Next.js) + `tg-server` (FastAPI)

---

## Overview

Every end user (person messaging a bot on Telegram or Instagram) gets a 30-day free trial per bot. When the trial expires:

1. The bot automatically sends a Stripe payment link to the end user in-chat (every message, until paid)
2. The admin's dashboard CRM shows a notification card for each expired/converted user
3. Once the end user pays, the bot resumes normal AI responses automatically

**Admins are fully exempt** — testing via the dashboard embed chat never triggers a trial.

---

## Stripe Account

**One Stripe account only — Yetti's.** All end-user payments flow into Yetti's existing Stripe account. Admins never configure Stripe. Super-admin handles any admin payouts manually (out of scope for this implementation).

---

## Data Model

### New table: `end_user_trials`

```sql
CREATE TABLE public.end_user_trials (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id                     UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    platform                   TEXT NOT NULL CHECK (platform IN ('telegram', 'instagram')),
    platform_user_id           TEXT NOT NULL,
    trial_start_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_at               TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    status                     TEXT NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active', 'expired', 'subscribed', 'cancelled')),
    stripe_checkout_url        TEXT,
    stripe_checkout_session_id TEXT,
    stripe_checkout_expires_at TIMESTAMPTZ,
    stripe_customer_id         TEXT,
    stripe_subscription_id     TEXT,
    admin_notified_at          TIMESTAMPTZ,   -- prevents duplicate CRM/email pings
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bot_id, platform, platform_user_id)
);

CREATE INDEX end_user_trials_bot_id_idx    ON public.end_user_trials (bot_id);
CREATE INDEX end_user_trials_status_idx    ON public.end_user_trials (status);
CREATE INDEX end_user_trials_platform_idx  ON public.end_user_trials (bot_id, platform, platform_user_id);
```

### New columns on `agents`

```sql
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS subscription_enabled  BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS end_user_price_cents  INTEGER DEFAULT 999,   -- $9.99/mo
ADD COLUMN IF NOT EXISTS trial_days            INTEGER DEFAULT 30;
```

---

## System Flow

```
End user sends message on Telegram/Instagram
        │
        ▼
tg-server: telegram_chat()
        │
        ├─ bot.subscription_enabled == false? ──► call agent normally
        │
        └─ subscription_enabled == true
                │
                ▼
        get_or_create_trial(bot_id, platform, platform_user_id)
                │
                ├─ status == 'active'  ──────────────────────────────► call agent normally
                │
                ├─ status == 'subscribed' ───────────────────────────► call agent normally
                │
                └─ status == 'expired'
                        │
                        ├─ get_or_create_checkout_url(trial)
                        │       └─ Uses Yetti's Stripe key
                        │       └─ Stripe Checkout Session (subscription mode)
                        │       └─ metadata: {trial_id, bot_id, platform, platform_user_id}
                        │       └─ success_url: /api/payment/bot-subscription/success
                        │       └─ Cached 23h in end_user_trials
                        │
                        ├─ Return payment link message to user in chat
                        │
                        └─ If admin_notified_at IS NULL:
                                └─ Insert CRM notification (end_user_trial_notifications)
                                └─ Send email to bot owner via Resend
                                └─ Set admin_notified_at = NOW()
```

---

## Phase Breakdown

### Phase 1 — Database Migration
**Repo:** Both (shared Supabase)

- Create `end_user_trials` table (full schema above)
- Create `end_user_trial_notifications` table for admin CRM
- Add `subscription_enabled`, `end_user_price_cents`, `trial_days` to `agents`
- Migration file: `supabase/migrations/YYYYMMDD_end_user_trials.sql` (both repos)

### Phase 2 — tg-server Subscription Service
**Repo:** `tg-server`

**New file:** `app/services/subscription_service.py`
- `get_or_create_trial(bot_id, platform, platform_user_id)` — upsert trial, auto-expire if past deadline
- `get_bot_subscription_config(bot_id)` — fetch `subscription_enabled`, `end_user_price_cents`, `trial_days`
- `get_or_create_checkout_url(trial, price_cents, bot_name)` — create Stripe Checkout Session using Yetti's `STRIPE_SECRET_KEY` env var; cache result
- `notify_admin(trial, bot_id)` — insert CRM notification row + trigger email

**Modified:** `app/api/telegram_handler.py`
- After receiving request, before `run_for_agent()`:
  - Fetch bot config
  - If `subscription_enabled`: run trial check gate
  - If expired: return payment link message (skip agent call entirely)

**New env var needed in tg-server:** `STRIPE_SECRET_KEY`, `YETTI_API_BASE_URL`

### Phase 3 — Stripe Webhook Update
**Repo:** `yetti-clone`

**Modified:** `app/api/stripe/webhook/route.ts`
- In `handleCheckoutSessionCompleted`: detect `trial_id` in session metadata
- If present: update `end_user_trials` status to `subscribed`, store `stripe_subscription_id`
- Insert a "subscribed" CRM notification

**New route:** `app/api/payment/bot-subscription/success/route.ts`
- Serves the redirect landing page after Stripe checkout
- Shows a "Payment successful — you can return to chat" confirmation

### Phase 4 — yetti-clone Frontend
**Repo:** `yetti-clone`

1. **Bot settings — Monetization tab** (`/dashboard/bots/[id]/settings` or inline on bot page)
   - Toggle: enable end-user subscriptions
   - Monthly price field (USD, stored as cents)
   - Trial duration (days, default 30)

2. **CRM notifications widget** — new component on `/dashboard/inbox` or `/dashboard/bots/[id]`
   - Lists all end users with expired trials (pending payment)
   - Lists recently subscribed end users
   - Each card: platform, platform_user_id (masked), bot name, status badge, timestamp

3. **Dashboard plans page** — restore and restyle the commented-out `/dashboard/plans/page.tsx` to the new design system

### Phase 5 — Admin Email Notification
**Repo:** `yetti-clone` (or tg-server via webhook)

- On trial expiry, send email via Resend to the bot owner:
  - Subject: "A user's trial on [Bot Name] has expired"
  - Body: platform, masked user ID, bot name, link to dashboard CRM
  - Guard with `admin_notified_at` — only fires once per expiry

---

## Environment Variables

| Var | Repo | Purpose |
|-----|------|---------|
| `STRIPE_SECRET_KEY` | tg-server | Create end-user Checkout Sessions |
| `YETTI_API_BASE_URL` | tg-server | Success URL for Stripe redirects |
| `RESEND_API_KEY` | tg-server or yetti-clone | Admin expiry emails |
| `NEXT_PUBLIC_APP_URL` | yetti-clone | Already present |

---

## Security Notes

- Checkout Sessions created server-side only (tg-server or API route), never client-side
- Webhook signature verified with `STRIPE_WEBHOOK_SECRET` before any DB write
- `trial_id` in Stripe metadata allows the webhook to find the exact trial record
- `admin_notified_at` guard prevents spam emails on repeated messages from expired users

---

## Out of Scope (v1)

- Admin payouts / revenue share
- Per-bot custom pricing visible to end users before trial ends
- Subscription cancellation flow for end users
- Usage limits within trial (trial is unlimited for 30 days)
- Instagram payment flow (build Telegram first, reuse service for Instagram)
