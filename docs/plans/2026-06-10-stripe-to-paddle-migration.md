# Stripe → Paddle Migration Plan

**Goal:** Completely replace Stripe with Paddle in both yetti-clone (Next.js) and tg-server (Python/FastAPI).

**Architecture:** Paddle overlay checkout (client-side JS) for admin plans. Paddle transaction API for end-user bot subscriptions. Single webhook endpoint. DB columns reused (stripe_customer_id stores paddle customer ID — no migration needed).

**Tech Stack:** @paddle/paddle-node-sdk, @paddle/paddle-js, paddle-python-sdk, Next.js 14, FastAPI

---

### Task 1: Install Paddle packages in yetti-clone

**Files:** `package.json`

Remove `stripe`, `@stripe/stripe-js`. Add `@paddle/paddle-node-sdk`, `@paddle/paddle-js`.

---

### Task 2: Create lib/paddle.ts (replaces lib/stripe.ts)

**Files:** Create `lib/paddle.ts`, delete `lib/stripe.ts`

---

### Task 3: Create /api/paddle/webhook/route.ts

**Events to handle:**
- `subscription.activated` → create/update user_plans, process referral commission
- `subscription.updated` → update plan status + period dates
- `subscription.cancelled` → mark canceled
- `subscription.past_due` → mark past_due
- `transaction.paid` → handle end-user trial renewal

---

### Task 4: Create /api/paddle/plan, invoices, portal routes

Three routes using Paddle Node SDK + existing authenticate helper.

---

### Task 5: Rewrite app/dashboard/plans/page.tsx for Paddle overlay checkout

---

### Task 6: Update tg-server

Replace stripe with paddle-python-sdk in requirements.txt, settings.py, subscription_service.py.

---

### Task 7: Remove all old /api/stripe/ routes
