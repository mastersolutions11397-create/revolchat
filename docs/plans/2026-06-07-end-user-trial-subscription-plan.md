# End-User Trial & Subscription System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Every end user who chats with a bot via Telegram/Instagram gets a 30-day free trial; after expiry the bot sends a Stripe payment link in-chat every message until paid, and the admin's dashboard CRM shows a notification.

**Architecture:** Shared Supabase instance tracks trial state per (bot_id, platform, platform_user_id). tg-server intercepts the telegram_chat() call, checks trial status, and either calls the AI agent normally or returns a payment link message. yetti-clone's Stripe webhook marks trials as `subscribed` when payment completes. Admin sees CRM notification cards in their dashboard.

**Tech Stack:** Next.js 15 + TypeScript + Supabase (service role) + Stripe (yetti-clone); FastAPI + Python + supabase-py + stripe-python (tg-server); Resend (email); Tailwind CSS + Inter (UI)

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/010_end_user_trials.sql` (yetti-clone)
- Create: `supabase_migrations/20260607000000_end_user_trials.sql` (tg-server, reference copy)

**Step 1: Write the migration file**

Create `/Users/affanzahir/code/yetti-clone/supabase/migrations/010_end_user_trials.sql`:

```sql
-- Migration 010: End-user trial and subscription system
-- Run in Supabase SQL Editor

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
```

**Step 2: Run migration in Supabase SQL Editor**

Log into the Supabase dashboard → SQL Editor → paste and run the migration.

**Step 3: Verify tables exist**

Run in SQL Editor:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'end_user_trials'
ORDER BY ordinal_position;
```
Expected: rows for id, bot_id, platform, platform_user_id, status, stripe_checkout_url, etc.

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agents' AND column_name IN ('subscription_enabled','end_user_price_cents','trial_days');
```
Expected: 3 rows.

**Step 4: Copy migration to tg-server**

```bash
cp /Users/affanzahir/code/yetti-clone/supabase/migrations/010_end_user_trials.sql \
   /Users/affanzahir/code/tg-server/supabase_migrations/20260607000000_end_user_trials.sql
```

**Step 5: Commit both**

```bash
cd /Users/affanzahir/code/yetti-clone
git add supabase/migrations/010_end_user_trials.sql
git commit -m "feat: add end_user_trials and notification tables migration"

cd /Users/affanzahir/code/tg-server
git add supabase_migrations/20260607000000_end_user_trials.sql
git commit -m "feat: add end_user_trials migration reference"
```

---

## Task 2: tg-server — Add Stripe Dependency & Settings

**Files:**
- Modify: `/Users/affanzahir/code/tg-server/requirements.txt`
- Modify: `/Users/affanzahir/code/tg-server/app/settings.py`

**Step 1: Add stripe to requirements.txt**

Add this line to `requirements.txt` after `httpx==0.27.2`:
```
stripe==11.4.1
```

**Step 2: Add settings fields**

In `app/settings.py`, add these two fields inside the `Settings` class, after `openai_api_key`:

```python
# Stripe (Yetti's account — for end-user trial checkout sessions)
stripe_secret_key: Optional[str] = None

# Base URL for Stripe success/cancel redirects
yetti_api_base_url: str = "https://yetti.ai"
```

**Step 3: Install the new dependency**

```bash
cd /Users/affanzahir/code/tg-server
pip install stripe==11.4.1
```
Expected: `Successfully installed stripe-11.4.1`

**Step 4: Add env vars to .env**

In `/Users/affanzahir/code/tg-server/.env`, add:
```
STRIPE_SECRET_KEY=sk_live_...        # Yetti's Stripe secret key
YETTI_API_BASE_URL=https://yetti.ai
```

**Step 5: Verify settings load**

```bash
cd /Users/affanzahir/code/tg-server
python -c "from app.settings import settings; print(settings.stripe_secret_key[:7] if settings.stripe_secret_key else 'NOT SET')"
```
Expected: `sk_live` or `sk_test`

**Step 6: Commit**

```bash
cd /Users/affanzahir/code/tg-server
git add requirements.txt app/settings.py
git commit -m "feat: add stripe dependency and subscription settings"
```

---

## Task 3: tg-server — Subscription Service

**Files:**
- Create: `/Users/affanzahir/code/tg-server/app/services/__init__.py`
- Create: `/Users/affanzahir/code/tg-server/app/services/subscription_service.py`

**Step 1: Create services package**

Create `/Users/affanzahir/code/tg-server/app/services/__init__.py` (empty file).

**Step 2: Write subscription_service.py**

Create `/Users/affanzahir/code/tg-server/app/services/subscription_service.py`:

```python
"""End-user trial and subscription management."""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

import stripe

from app.db.supabase import supabase
from app.settings import settings

logger = logging.getLogger(__name__)


def _stripe_key() -> str:
    key = settings.stripe_secret_key
    if not key:
        raise RuntimeError("STRIPE_SECRET_KEY is not configured")
    return key


async def get_or_create_trial(bot_id: str, platform: str, platform_user_id: str) -> dict:
    """
    Return the trial record for this (bot, platform, user) triplet.
    Creates a new 30-day trial on first call.
    Auto-transitions status from 'active' → 'expired' when deadline passes.
    Fails open (returns {'status': 'active'}) if DB is unavailable.
    """
    if not supabase:
        logger.warning("Supabase unavailable — skipping trial check")
        return {"status": "active"}

    try:
        result = (
            supabase.table("end_user_trials")
            .select("*")
            .eq("bot_id", bot_id)
            .eq("platform", platform)
            .eq("platform_user_id", platform_user_id)
            .maybe_single()
            .execute()
        )

        if not result.data:
            # First ever message from this user on this bot — start trial
            insert = (
                supabase.table("end_user_trials")
                .insert({
                    "bot_id": bot_id,
                    "platform": platform,
                    "platform_user_id": platform_user_id,
                })
                .execute()
            )
            return insert.data[0]

        trial = result.data

        # Auto-expire
        if trial["status"] == "active":
            trial_end = datetime.fromisoformat(
                trial["trial_end_at"].replace("Z", "+00:00")
            )
            if datetime.now(timezone.utc) > trial_end:
                supabase.table("end_user_trials").update(
                    {"status": "expired"}
                ).eq("id", trial["id"]).execute()
                trial = {**trial, "status": "expired"}

        return trial

    except Exception as exc:
        logger.error("get_or_create_trial error: %s", exc)
        return {"status": "active"}


async def get_bot_subscription_config(bot_id: str) -> Optional[dict]:
    """
    Fetch subscription configuration from agents table.
    Returns None if bot not found or DB unavailable.
    """
    if not supabase:
        return None
    try:
        result = (
            supabase.table("agents")
            .select("id, name, user_id, subscription_enabled, end_user_price_cents, trial_days")
            .eq("id", bot_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as exc:
        logger.error("get_bot_subscription_config error: %s", exc)
        return None


async def get_or_create_checkout_url(
    trial: dict,
    price_cents: int,
    bot_name: str,
) -> str:
    """
    Return a cached Stripe Checkout Session URL, or create a new one.
    Sessions are cached for 23 hours (Stripe expires them at 24h).
    """
    now = datetime.now(timezone.utc)

    # Use cached URL if still valid
    if trial.get("stripe_checkout_url") and trial.get("stripe_checkout_expires_at"):
        try:
            expires = datetime.fromisoformat(
                trial["stripe_checkout_expires_at"].replace("Z", "+00:00")
            )
            if expires > now:
                return trial["stripe_checkout_url"]
        except Exception:
            pass

    base_url = settings.yetti_api_base_url.rstrip("/")
    stripe.api_key = _stripe_key()

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{
            "price_data": {
                "currency": "usd",
                "unit_amount": price_cents,
                "recurring": {"interval": "month"},
                "product_data": {
                    "name": f"{bot_name} — Monthly Subscription",
                    "description": "Continue chatting with your AI assistant.",
                },
            },
            "quantity": 1,
        }],
        metadata={
            "trial_id": trial.get("id", ""),
            "bot_id": trial.get("bot_id", ""),
            "platform": trial.get("platform", ""),
            "platform_user_id": trial.get("platform_user_id", ""),
            "source": "end_user_trial",
        },
        success_url=(
            f"{base_url}/payment/bot-subscription/success"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"{base_url}/billing/cancel",
        expires_at=int(now.timestamp()) + 82800,  # 23 hours
    )

    expires_at = datetime.fromtimestamp(session.expires_at, timezone.utc).isoformat()

    if supabase and trial.get("id"):
        try:
            supabase.table("end_user_trials").update({
                "stripe_checkout_url": session.url,
                "stripe_checkout_session_id": session.id,
                "stripe_checkout_expires_at": expires_at,
            }).eq("id", trial["id"]).execute()
        except Exception as exc:
            logger.error("Failed to cache checkout URL: %s", exc)

    return session.url


async def notify_admin_trial_expired(
    trial: dict,
    bot_name: str,
    admin_user_id: str,
) -> None:
    """
    Insert a CRM notification row for the admin.
    Guard: admin_notified_at prevents duplicate notifications.
    """
    if not supabase:
        return
    if trial.get("admin_notified_at"):
        return  # Already notified

    try:
        supabase.table("end_user_trial_notifications").insert({
            "trial_id": trial["id"],
            "bot_id": trial["bot_id"],
            "bot_name": bot_name,
            "admin_user_id": admin_user_id,
            "platform": trial["platform"],
            "platform_user_id": trial["platform_user_id"],
            "notification_type": "trial_expired",
        }).execute()

        supabase.table("end_user_trials").update(
            {"admin_notified_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", trial["id"]).execute()

        logger.info(
            "Admin %s notified of trial expiry for user %s on bot %s",
            admin_user_id,
            trial["platform_user_id"],
            trial["bot_id"],
        )
    except Exception as exc:
        logger.error("notify_admin_trial_expired error: %s", exc)
```

**Step 3: Verify import works**

```bash
cd /Users/affanzahir/code/tg-server
python -c "from app.services.subscription_service import get_or_create_trial; print('OK')"
```
Expected: `OK`

**Step 4: Commit**

```bash
git add app/services/__init__.py app/services/subscription_service.py
git commit -m "feat: add subscription_service for end-user trial management"
```

---

## Task 4: tg-server — Wire Subscription Gate into Telegram Handler

**Files:**
- Modify: `/Users/affanzahir/code/tg-server/app/api/telegram_handler.py`

**Step 1: Add imports at top of file**

After the existing imports, add:
```python
from app.services.subscription_service import (
    get_bot_subscription_config,
    get_or_create_trial,
    get_or_create_checkout_url,
    notify_admin_trial_expired,
)
```

**Step 2: Replace the body of `telegram_chat()` with the gated version**

Replace the entire `try:` block inside `async def telegram_chat(request: TelegramChatRequest)` with:

```python
    try:
        conversation_id = request.conversation_id or f"telegram_{request.user_id}_{request.agent_id}"
        logger.info(f"Telegram chat request: agent={request.agent_id}, user={request.user_id}")

        # ── Subscription gate ──────────────────────────────────────────────────
        bot_config = await get_bot_subscription_config(request.agent_id)
        if bot_config and bot_config.get("subscription_enabled"):
            trial = await get_or_create_trial(
                bot_id=request.agent_id,
                platform="telegram",
                platform_user_id=request.user_id,
            )
            if trial.get("status") == "expired":
                payment_url = await get_or_create_checkout_url(
                    trial=trial,
                    price_cents=bot_config.get("end_user_price_cents", 999),
                    bot_name=bot_config.get("name", "Bot"),
                )
                await notify_admin_trial_expired(
                    trial=trial,
                    bot_name=bot_config.get("name", "Bot"),
                    admin_user_id=bot_config.get("user_id", ""),
                )
                expired_message = (
                    "⏰ Your free trial has ended!\n\n"
                    f"To continue chatting, please subscribe here:\n{payment_url}\n\n"
                    "You'll have full access again immediately after subscribing."
                )
                if request.humanize_delivery:
                    await asyncio.sleep(get_human_like_delay_seconds(expired_message))
                return TelegramChatResponse(
                    response=expired_message,
                    agent_id=request.agent_id,
                    conversation_id=conversation_id,
                    media=[],
                )
            # status == 'active' or 'subscribed' → fall through to agent call
        # ── End subscription gate ──────────────────────────────────────────────

        # Run LLM and trigger image fetch in parallel
        response_task = asyncio.create_task(run_for_agent(
            agent_id=request.agent_id,
            prompt=request.message,
            session_id=conversation_id,
            user_id=request.user_id,
            enable_memory=request.enable_memory,
            fast_mode=request.fast_mode,
        ))
        media_task = asyncio.create_task(get_trigger_images(request.agent_id, request.message))

        response, media = await asyncio.gather(response_task, media_task)

        if request.humanize_delivery:
            await asyncio.sleep(get_human_like_delay_seconds(response))

        return TelegramChatResponse(
            response=response,
            agent_id=request.agent_id,
            conversation_id=conversation_id,
            media=media,
        )

    except ValueError as e:
        logger.error(f"Agent not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception(f"Error processing Telegram chat: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")
```

**Step 3: Manual smoke test**

```bash
cd /Users/affanzahir/code/tg-server
uvicorn app.main:app --reload --port 8000
```

In a second terminal:
```bash
curl -s -X POST http://localhost:8000/telegram/chat \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"<any-real-bot-id>","user_id":"test_user_999","message":"hello","humanize_delivery":false}' \
  | python3 -m json.tool
```

Expected: JSON response with `response` field (either AI response or payment link if bot has subscription_enabled=true and trial is expired).

**Step 4: Commit**

```bash
git add app/api/telegram_handler.py
git commit -m "feat: add subscription trial gate to telegram_chat endpoint"
```

---

## Task 5: yetti-clone — Bot Subscription Settings API Route

**Files:**
- Create: `app/api/bots/[id]/subscription/route.ts`

**Step 1: Create the route file**

Create `/Users/affanzahir/code/yetti-clone/app/api/bots/[id]/subscription/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { authenticate } from "@/lib/api-auth";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await authenticate(_req);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("agents")
      .select("id, subscription_enabled, end_user_price_cents, trial_days")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await authenticate(req);
    const { id } = await params;

    // Verify ownership
    const { data: bot, error: fetchErr } = await supabaseAdmin
      .from("agents")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (typeof body.subscription_enabled === "boolean")
      patch.subscription_enabled = body.subscription_enabled;
    if (typeof body.end_user_price_cents === "number" && body.end_user_price_cents > 0)
      patch.end_user_price_cents = body.end_user_price_cents;
    if (typeof body.trial_days === "number" && body.trial_days > 0)
      patch.trial_days = body.trial_days;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("agents")
      .update(patch)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
```

**Step 2: Type-check**

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output (no errors).

**Step 3: Commit**

```bash
git add "app/api/bots/[id]/subscription/route.ts"
git commit -m "feat: add bot subscription settings GET/PATCH API route"
```

---

## Task 6: yetti-clone — CRM Notifications API Route

**Files:**
- Create: `app/api/trial-notifications/route.ts`

**Step 1: Create route**

Create `/Users/affanzahir/code/yetti-clone/app/api/trial-notifications/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { authenticate } from "@/lib/api-auth";

// GET /api/trial-notifications — fetch unread notifications for current admin
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);

    const { data, error } = await supabaseAdmin
      .from("end_user_trial_notifications")
      .select("id, trial_id, bot_id, bot_name, platform, platform_user_id, notification_type, read_at, created_at")
      .eq("admin_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

// PATCH /api/trial-notifications — mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();
    const ids: string[] = body.ids ?? [];

    if (!ids.length) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("end_user_trial_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("admin_user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 3: Commit**

```bash
git add app/api/trial-notifications/route.ts
git commit -m "feat: add trial notifications API (GET list, PATCH mark-read)"
```

---

## Task 7: yetti-clone — Update Stripe Webhook for End-User Trials

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

**Step 1: Add `handleEndUserTrialSubscription` helper function**

In `app/api/stripe/webhook/route.ts`, add this function before `handleCheckoutSessionCompleted`:

```typescript
async function handleEndUserTrialSubscription(session: Stripe.Checkout.Session) {
  const { trial_id, bot_id, platform, platform_user_id } = session.metadata ?? {};
  if (!trial_id) return;

  // Fetch bot name for the notification
  const { data: bot } = await supabaseAdmin
    .from("agents")
    .select("name, user_id")
    .eq("id", bot_id)
    .single();

  const updateData: Record<string, unknown> = {
    status: "subscribed",
    stripe_customer_id: session.customer as string,
  };
  if (session.subscription) {
    updateData.stripe_subscription_id = session.subscription as string;
  }

  const { error } = await supabaseAdmin
    .from("end_user_trials")
    .update(updateData)
    .eq("id", trial_id);

  if (error) {
    throw new Error(`Failed to update trial ${trial_id}: ${error.message}`);
  }

  // Insert "subscribed" CRM notification
  await supabaseAdmin.from("end_user_trial_notifications").insert({
    trial_id,
    bot_id,
    bot_name: bot?.name ?? "Bot",
    admin_user_id: bot?.user_id ?? "",
    platform,
    platform_user_id,
    notification_type: "subscribed",
  });

  console.log(`End-user trial ${trial_id} converted to subscription`);
}
```

**Step 2: Update `handleCheckoutSessionCompleted` to detect end-user payments**

At the very top of the `handleCheckoutSessionCompleted` function body, add an early-return for end-user trials before the existing `userId` check:

```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Handle end-user trial subscriptions (no userId in metadata)
    if (session.metadata?.source === "end_user_trial") {
      await handleEndUserTrialSubscription(session);
      return;
    }

    // --- existing admin subscription logic below (unchanged) ---
    const { userId } = session.metadata || {};
    // ... rest of existing function unchanged ...
```

**Step 3: Type-check**

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 4: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat: handle end-user trial conversion in Stripe webhook"
```

---

## Task 8: yetti-clone — Payment Success Page for End-User Trials

**Files:**
- Create: `app/payment/bot-subscription/success/page.tsx`

**Step 1: Create the page**

Create `/Users/affanzahir/code/yetti-clone/app/payment/bot-subscription/success/page.tsx`:

```tsx
import Link from "next/link";
import { CheckCircle2, MessageSquare } from "lucide-react";

export default function BotSubscriptionSuccessPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-bg mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          You&apos;re subscribed!
        </h1>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          Your payment was successful. Return to the chat — your AI assistant
          is ready and waiting.
        </p>

        <div className="bg-surface border border-border rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
            <span className="font-semibold text-text-primary text-sm">What&apos;s next?</span>
          </div>
          <ul className="text-sm text-text-muted space-y-1 ml-8">
            <li>Go back to Telegram or Instagram</li>
            <li>Send any message to the bot</li>
            <li>Your full access is already active</li>
          </ul>
        </div>

        <p className="text-xs text-text-muted">
          Questions?{" "}
          <Link
            href="mailto:support@yetti.ai"
            className="text-brand hover:text-brand-light transition-colors"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 3: Commit**

```bash
git add app/payment/bot-subscription/success/page.tsx
git commit -m "feat: add end-user bot subscription success page"
```

---

## Task 9: yetti-clone — Bot Monetization Settings UI

**Files:**
- Modify: `app/dashboard/bots/page.tsx`

**Step 1: Add subscription state and types to the page**

In `app/dashboard/bots/page.tsx`, add to the `BotRecord` type:
```typescript
export type BotRecord = {
  // ...existing fields...
  subscriptionEnabled: boolean;
  endUserPriceCents: number;
  trialDays: number;
};
```

Update `botFromAPI()` to include new fields:
```typescript
function botFromAPI(a: Agent): BotRecord {
  return {
    // ...existing fields...
    subscriptionEnabled: (a as any).subscription_enabled ?? false,
    endUserPriceCents: (a as any).end_user_price_cents ?? 999,
    trialDays: (a as any).trial_days ?? 30,
  };
}
```

**Step 2: Add monetization state to BotsPage**

Inside `BotsPage`, add these state variables:
```typescript
const [monetizationBot, setMonetizationBot] = useState<BotRecord | null>(null);
const [subEnabled, setSubEnabled] = useState(false);
const [subPriceCents, setSubPriceCents] = useState(999);
const [subTrialDays, setSubTrialDays] = useState(30);
const [subSaving, setSubSaving] = useState(false);
```

**Step 3: Add `saveMonetization` handler**

```typescript
const saveMonetization = useCallback(async () => {
  if (!monetizationBot) return;
  setSubSaving(true);
  try {
    const res = await fetch(`/api/bots/${monetizationBot.id}/subscription`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription_enabled: subEnabled,
        end_user_price_cents: subPriceCents,
        trial_days: subTrialDays,
      }),
    });
    if (!res.ok) throw new Error("Failed to save");
    toast.success("Monetization settings saved");
    setMonetizationBot(null);
    fetchBots();
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Save failed");
  } finally {
    setSubSaving(false);
  }
}, [monetizationBot, subEnabled, subPriceCents, subTrialDays, fetchBots]);
```

**Step 4: Add Monetization modal JSX**

Add this modal inside the page's return, after the existing modals:

```tsx
{/* Monetization Modal */}
{monetizationBot && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-surface rounded-2xl shadow-card-md border border-border w-full max-w-md p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-text-primary">Monetization</h2>
        <button
          onClick={() => setMonetizationBot(null)}
          className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Enable toggle */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Enable end-user subscriptions
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Users get a free trial, then receive a payment link when it expires
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={subEnabled}
            onClick={() => setSubEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              subEnabled ? "bg-brand" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                subEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        {subEnabled && (
          <>
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1.5">
                Monthly price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={(subPriceCents / 100).toFixed(2)}
                  onChange={(e) =>
                    setSubPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))
                  }
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
                />
              </div>
            </div>

            {/* Trial days */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1.5">
                Free trial duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={subTrialDays}
                onChange={(e) => setSubTrialDays(parseInt(e.target.value || "30"))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition-all"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setMonetizationBot(null)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-background text-sm font-medium transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={saveMonetization}
          disabled={subSaving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-brand transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {subSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 5: Add "Monetize" button to each bot card**

Find the section that renders each bot's action buttons (near the Delete and Edit buttons). Add a Monetize button:

```tsx
<button
  onClick={() => {
    setMonetizationBot(bot);
    setSubEnabled(bot.subscriptionEnabled);
    setSubPriceCents(bot.endUserPriceCents);
    setSubTrialDays(bot.trialDays);
  }}
  className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-all cursor-pointer"
  title="Monetization settings"
  aria-label={`Configure monetization for ${bot.name}`}
>
  <CreditCard className="w-4 h-4" />
</button>
```

Add `CreditCard` to the lucide-react import at the top of the file.

**Step 6: Type-check and verify**

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 7: Commit**

```bash
git add app/dashboard/bots/page.tsx
git commit -m "feat: add monetization settings UI to bot management page"
```

---

## Task 10: yetti-clone — Trial Notifications CRM Widget

**Files:**
- Create: `components/dashboard/TrialNotificationsWidget.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Create the widget component**

Create `/Users/affanzahir/code/yetti-clone/components/dashboard/TrialNotificationsWidget.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, AlertCircle, X } from "lucide-react";

type TrialNotification = {
  id: string;
  trial_id: string;
  bot_id: string;
  bot_name: string;
  platform: string;
  platform_user_id: string;
  notification_type: "trial_expired" | "subscribed";
  read_at: string | null;
  created_at: string;
};

export default function TrialNotificationsWidget() {
  const [notifications, setNotifications] = useState<TrialNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/trial-notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // silently fail — non-critical widget
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    await fetch("/api/trial-notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }, []);

  const unread = notifications.filter((n) => !n.read_at);

  if (loading || notifications.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">
            User Notifications
          </span>
          {unread.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-xs font-bold">
              {unread.length}
            </span>
          )}
        </div>
      </div>

      <ul className="divide-y divide-border max-h-64 overflow-y-auto">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors ${
              n.read_at ? "opacity-60" : "bg-surface"
            }`}
          >
            {n.notification_type === "subscribed" ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary">
                {n.notification_type === "subscribed" ? (
                  <>
                    <span className="font-semibold">{n.platform}</span> user subscribed
                    on <span className="font-semibold">{n.bot_name}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{n.platform}</span> user trial expired
                    on <span className="font-semibold">{n.bot_name}</span> — payment link sent
                  </>
                )}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.read_at && (
              <button
                onClick={() => markRead(n.id)}
                className="text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
                aria-label="Mark as read"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Step 2: Add widget to the dashboard page**

In `app/dashboard/page.tsx`, add the import near the top of the file (after existing imports):
```typescript
import TrialNotificationsWidget from "@/components/dashboard/TrialNotificationsWidget";
```

Then add the widget inside the return JSX, after the stats cards section:
```tsx
{/* Trial notifications CRM */}
<TrialNotificationsWidget />
```

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 4: Commit**

```bash
git add components/dashboard/TrialNotificationsWidget.tsx app/dashboard/page.tsx
git commit -m "feat: add trial notifications CRM widget to dashboard"
```

---

## Task 11: yetti-clone — Restore Dashboard Plans Page

**Files:**
- Modify: `app/dashboard/plans/page.tsx`

**Step 1: Replace placeholder with working plans page**

Replace the entire contents of `/Users/affanzahir/code/yetti-clone/app/dashboard/plans/page.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getStripe, PLAN_CONFIGS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Check, Loader2, Zap, Shield, Star, Crown } from "lucide-react";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter: Zap,
  growth: Star,
  pro: Crown,
  enterprise: Shield,
};

type UserPlan = {
  plan_name: string;
  status: string;
  current_period_end: string | null;
};

export default function PlansPage() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/yetti/me")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan ?? null))
      .catch(() => null)
      .finally(() => setPlanLoading(false));
  }, [user]);

  const handleSubscribe = async (planKey: string) => {
    if (!user) return;
    const plan = PLAN_CONFIGS[planKey];
    if (!plan) return;

    setCheckingOut(planKey);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });
      const { sessionId, error } = await res.json();
      if (error || !sessionId) throw new Error(error ?? "Failed to start checkout");

      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  };

  const plans = Object.entries(PLAN_CONFIGS).filter(([k]) => k !== "yetti_credits");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Plans</h1>
        <p className="text-text-muted mt-1 text-sm">
          Choose the plan that fits your usage.
        </p>
      </div>

      {!planLoading && userPlan && (
        <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-brand shrink-0" />
          <span className="text-sm text-brand font-medium">
            Current plan:{" "}
            <strong>{userPlan.plan_name}</strong>
            {userPlan.current_period_end && (
              <span className="text-brand/70 font-normal">
                {" "}· renews {new Date(userPlan.current_period_end).toLocaleDateString()}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(([key, plan]) => {
          const Icon = PLAN_ICONS[key] ?? Zap;
          const isCurrent = userPlan?.plan_name.toLowerCase() === plan.name.toLowerCase();
          const isLoading = checkingOut === key;

          return (
            <div
              key={key}
              className={`relative bg-surface border rounded-2xl p-5 flex flex-col transition-shadow hover:shadow-card-md ${
                isCurrent ? "border-brand ring-2 ring-brand/20" : "border-border"
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 bg-brand text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Current
                </span>
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
                </div>
                <span className="font-bold text-text-primary">{plan.name}</span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-text-primary">
                  ${plan.price}
                </span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {plan.credits.toLocaleString()} credits/month
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  All integrations
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  Priority support
                </li>
              </ul>

              <button
                onClick={() => !isCurrent && handleSubscribe(key)}
                disabled={isCurrent || isLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-brand/10 text-brand cursor-default"
                    : "bg-brand hover:bg-brand-dark text-white shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </span>
                ) : isCurrent ? (
                  "Active"
                ) : (
                  `Subscribe — $${plan.price}/mo`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Re-add Plans to DashboardShell nav**

In `app/dashboard/DashboardShell.tsx`, find the nav items array and add Plans back:
```typescript
{ href: "/dashboard/plans", label: "Plans", icon: CreditCard }
```
Add `CreditCard` to the lucide-react import if not already present.

**Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 4: Commit**

```bash
git add app/dashboard/plans/page.tsx app/dashboard/DashboardShell.tsx
git commit -m "feat: restore dashboard plans page with new design system"
```

---

## Task 12: Admin Email Notification on Trial Expiry

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

**Step 1: Add `sendTrialExpiredEmail` helper**

In the webhook file, add this function (uses the existing Resend pattern already in the file):

```typescript
async function sendTrialExpiredEmail(adminUserId: string, botName: string, platform: string) {
  try {
    if (!process.env.RESEND_API_KEY) return;

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(adminUserId);
    if (!user?.email) return;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Yetti AI <notifications@yetti.ai>",
      to: user.email,
      subject: `A user's trial on "${botName}" has expired`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0F766E; margin-bottom: 8px;">Trial Expired</h2>
          <p style="color: #374151;">A <strong>${platform}</strong> user's 30-day trial on your bot <strong>"${botName}"</strong> has ended.</p>
          <p style="color: #374151;">We've automatically sent them a payment link. You'll receive another notification when they subscribe.</p>
          <div style="margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background:#0F766E;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
              View Dashboard
            </a>
          </div>
          <p style="color: #6B7280; font-size: 13px;">You're receiving this because you have a bot with monetization enabled on Yetti AI.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error sending trial expired email:", err);
  }
}
```

**Step 2: Call `sendTrialExpiredEmail` from `handleEndUserTrialSubscription`**

In `handleEndUserTrialSubscription`, after the CRM notification insert for `trial_expired` type — wait, this function handles `subscribed`. The expiry email is triggered from **tg-server** (in `notify_admin_trial_expired`).

Actually, to keep email sending in one place (yetti-clone where Resend is already configured), add a new API route that tg-server can call to trigger the email, OR let tg-server insert the notification row and a Supabase database webhook trigger sends the email.

**Simplest approach:** Call a Yetti internal API from tg-server's `notify_admin_trial_expired`.

**Step 3: Create internal notification trigger API**

Create `/Users/affanzahir/code/yetti-clone/app/api/internal/trial-expired-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Internal-only route called by tg-server. Protected by shared secret.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { admin_user_id, bot_name, platform } = await req.json();
  if (!admin_user_id || !bot_name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ skipped: "no RESEND_API_KEY" });
    }

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(admin_user_id);
    if (!user?.email) {
      return NextResponse.json({ skipped: "no email for admin" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Yetti AI <notifications@yetti.ai>",
      to: user.email,
      subject: `A user's trial on "${bot_name}" has expired`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#0F766E;margin-bottom:8px;">Trial Expired</h2>
          <p style="color:#374151;">A <strong>${platform}</strong> user's 30-day free trial on your bot <strong>"${bot_name}"</strong> has ended.</p>
          <p style="color:#374151;">We've automatically sent them a payment link in the chat. You'll get another notification when they subscribe.</p>
          <div style="margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://yetti.ai"}/dashboard"
               style="background:#0F766E;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
              View CRM Dashboard
            </a>
          </div>
          <p style="color:#6B7280;font-size:13px;">Yetti AI — trial expiry notification</p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Trial expired email error:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
```

**Step 4: Update tg-server's subscription_service.py to call the email endpoint**

In `notify_admin_trial_expired`, after inserting the notification row, add:

```python
# Trigger admin email via Yetti internal API
try:
    import httpx
    async with httpx.AsyncClient(timeout=5.0) as client:
        await client.post(
            f"{settings.yetti_api_base_url}/api/internal/trial-expired-email",
            json={
                "admin_user_id": admin_user_id,
                "bot_name": bot_name,
                "platform": trial["platform"],
            },
            headers={
                "x-internal-secret": settings.internal_api_secret or "",
                "Content-Type": "application/json",
            },
        )
except Exception as email_exc:
    logger.warning("Could not trigger trial expired email: %s", email_exc)
```

**Step 5: Add `internal_api_secret` to tg-server settings**

In `app/settings.py`, add:
```python
internal_api_secret: Optional[str] = None
```

Add to `.env` in both repos:
```
INTERNAL_API_SECRET=<generate: python -c "import secrets; print(secrets.token_hex(32))">
```

**Step 6: Type-check yetti-clone**

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 7: Commit both repos**

```bash
cd /Users/affanzahir/code/yetti-clone
git add app/api/internal/trial-expired-email/route.ts
git commit -m "feat: add internal trial-expired email trigger endpoint"

cd /Users/affanzahir/code/tg-server
git add app/services/subscription_service.py app/settings.py
git commit -m "feat: trigger admin email on trial expiry via internal API"
```

---

## End-to-End Verification Checklist

Run through this flow manually after all tasks are complete:

**Setup:**
1. In Supabase: confirm `end_user_trials` and `end_user_trial_notifications` tables exist
2. In Supabase: set one bot's `subscription_enabled = true`, `end_user_price_cents = 999`, `trial_days = 1` (1-day trial for fast testing)
3. Confirm `STRIPE_SECRET_KEY` and `YETTI_API_BASE_URL` set in tg-server `.env`
4. Confirm `INTERNAL_API_SECRET` matches in both repos

**Trial active flow:**
5. Send a Telegram message to the bot → bot responds with AI reply
6. Check Supabase: `end_user_trials` row created with `status = 'active'`

**Trial expired flow:**
7. Manually update the trial row in Supabase: `UPDATE end_user_trials SET trial_end_at = NOW() - INTERVAL '1 minute' WHERE ...`
8. Send another Telegram message → bot responds with payment link message (not AI reply)
9. Check Supabase: `status = 'expired'`, `stripe_checkout_url` populated
10. Check `end_user_trial_notifications`: one row with `notification_type = 'trial_expired'`
11. Check admin email inbox for trial expiry notification

**Payment flow:**
12. Open the Stripe checkout URL from step 8 in browser
13. Complete payment with Stripe test card `4242 4242 4242 4242`
14. Stripe webhook fires → `end_user_trials.status = 'subscribed'`
15. New `end_user_trial_notifications` row with `notification_type = 'subscribed'`
16. Send another Telegram message → bot responds with AI reply again

**Dashboard:**
17. Open `/dashboard` → TrialNotificationsWidget shows expiry + subscribed cards
18. Open `/dashboard/plans` → plan cards render correctly
19. Open `/dashboard/bots` → Monetize button on each bot → modal opens, saves correctly

---

## Files Changed Summary

| Repo | File | Action |
|------|------|--------|
| yetti-clone | `supabase/migrations/010_end_user_trials.sql` | Create |
| tg-server | `supabase_migrations/20260607000000_end_user_trials.sql` | Create (copy) |
| tg-server | `requirements.txt` | Add stripe |
| tg-server | `app/settings.py` | Add stripe_secret_key, yetti_api_base_url, internal_api_secret |
| tg-server | `app/services/__init__.py` | Create |
| tg-server | `app/services/subscription_service.py` | Create |
| tg-server | `app/api/telegram_handler.py` | Modify (subscription gate) |
| yetti-clone | `app/api/bots/[id]/subscription/route.ts` | Create |
| yetti-clone | `app/api/trial-notifications/route.ts` | Create |
| yetti-clone | `app/api/stripe/webhook/route.ts` | Modify |
| yetti-clone | `app/api/internal/trial-expired-email/route.ts` | Create |
| yetti-clone | `app/payment/bot-subscription/success/page.tsx` | Create |
| yetti-clone | `app/dashboard/bots/page.tsx` | Modify |
| yetti-clone | `app/dashboard/DashboardShell.tsx` | Modify |
| yetti-clone | `app/dashboard/plans/page.tsx` | Restore |
| yetti-clone | `components/dashboard/TrialNotificationsWidget.tsx` | Create |
