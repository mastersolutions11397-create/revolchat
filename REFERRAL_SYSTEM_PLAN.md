# Referral System Implementation Plan

## Overview

Implement a referral system where users earn 30% commission when someone they refer purchases a plan.

## Current System Understanding

- **Plans**: Starter ($29), Growth ($59), Pro ($99), Enterprise ($179)
- **Payment**: Stripe subscriptions handled via webhooks
- **Database**: Supabase (PostgreSQL)
- **User System**: Supabase Auth
- **Credits System**: Already exists in `user_credits` table

---

## Database Schema Changes

### 1. `referrals` Table

Track referral relationships and status.

```sql
CREATE TABLE public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL, -- Unique code for the referrer
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referee_id), -- A user can only be referred once
    UNIQUE(referral_code) -- Each referral code is unique
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
```

### 2. `referral_commissions` Table

Track commission payments/credits awarded.

```sql
CREATE TABLE public.referral_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    plan_price DECIMAL(10, 2) NOT NULL, -- Original plan price
    commission_amount DECIMAL(10, 2) NOT NULL, -- 30% of plan price
    commission_type TEXT NOT NULL DEFAULT 'credits' CHECK (commission_type IN ('credits', 'cash', 'pending')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    stripe_invoice_id TEXT, -- Link to Stripe invoice for tracking
    user_plan_id UUID REFERENCES user_plans(id), -- Link to the purchased plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX idx_commissions_status ON referral_commissions(status);
CREATE INDEX idx_commissions_plan ON referral_commissions(user_plan_id);
```

### 3. Update `users` Table (or create `user_profiles`)

Add referral code to user profile.

```sql
-- Option 1: Add to existing user metadata
-- Option 2: Create user_profiles table if it doesn't exist

ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Or if using a separate profiles table:
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    referral_code TEXT UNIQUE NOT NULL,
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## Implementation Components

### 1. Referral Code Generation

- **When**: On user signup or first login
- **Format**: Unique code (e.g., `USER-ABC123`, `AFFAN-7X9K2`, or UUID-based)
- **Storage**: In user profile/metadata
- **Uniqueness**: Enforced at database level

### 2. Referral Link Tracking

- **URL Format**: `https://yetti.ai/signup?ref=REFERRAL_CODE`
- **Storage**: Store referral code in:
  - URL parameter during signup
  - LocalStorage/sessionStorage
  - Cookie (optional, for cross-session tracking)

### 3. Signup Flow Integration

- **Modify**: `app/auth/signup/page.tsx`
- **Action**:
  - Check for `?ref=CODE` in URL
  - Store referral code in signup metadata or session
  - Link referral after successful signup

### 4. Commission Calculation & Award

- **Trigger**: When `invoice.payment_succeeded` webhook fires
- **Location**: `app/api/stripe/webhook/route.ts`
- **Logic**:
  1. Check if new user has a referrer (check `referrals` table)
  2. Calculate 30% of plan price
  3. Create commission record
  4. Award credits to referrer (or mark as pending cash)

### 5. Referral Dashboard

- **Location**: `app/dashboard/referrals/page.tsx` (new page)
- **Features**:
  - Display referral code/link
  - Share buttons (copy link, social media)
  - List of referrals (pending/completed)
  - Commission earnings history
  - Total earnings summary
  - Withdrawal options (if cash payouts)

### 6. supabase direct connections 
dont make the api endpoints connect directly to supabase tables 

---

## Commission Payout Options

### Option A: Credits (Recommended for MVP)

- **How**: Award commission as credits to referrer's account
- **When**: Immediately upon successful payment
- **Pros**:
  - Simple implementation
  - No payment processing needed
  - Users can use credits immediately
- **Cons**:
  - Not cash, but credits

### Option B: Cash Payouts

- **How**: Transfer to bank account/PayPal/Stripe Connect
- **When**: Monthly payout or on-demand
- **Pros**:
  - Real money incentive
  - More attractive to referrers
- **Cons**:
  - Requires payment processing
  - Tax implications
  - Minimum payout thresholds
  - More complex

### Option C: Hybrid

- **How**: Credits by default, option to convert to cash
- **When**: User choice
- **Pros**:
  - Flexibility
- **Cons**:
  - More complex

---

## User Flow

### Referrer Flow:

1. User signs up → Gets unique referral code
2. User goes to Referrals dashboard
3. User copies referral link: `yetti.ai/signup?ref=THEIR_CODE`
4. User shares link (social media, email, etc.)
5. When someone signs up via link → Referral tracked
6. When referee buys plan → Commission awarded
7. Referrer sees earnings in dashboard

### Referee Flow:

1. Clicks referral link: `yetti.ai/signup?ref=CODE`
2. Signs up (referral code stored)
3. Buys a plan
4. Referrer automatically gets 30% commission

---

## Security & Validation

1. **Self-Referral Prevention**:
   - Block users from using their own referral code
   - Validate referrer_id ≠ referee_id

2. **Duplicate Referral Prevention**:
   - One referral per user (enforced by UNIQUE constraint)
   - Check if user already has a referrer before assigning

3. **Code Validation**:
   - Validate referral code exists and is active
   - Check expiration (if applicable)

4. **Commission Validation**:
   - Only award on successful payment
   - Prevent duplicate commissions
   - Handle refunds (reverse commission?)

---

## Questions for You

### 1. Commission Payout Method

**Q: How should referrers receive their 30% commission?**

- [ ] Credits (added to their account balance)
- [✅ ] Cash (transferred to bank/PayPal)
- [ ] Hybrid (user chooses)

### 2. Referral Code Format

**Q: What format should referral codes use?**

- [✅ ] Username-based (e.g., `AFFAN-7X9K2`)
- [ ] Random alphanumeric (e.g., `ABC123XYZ`)
- [ ] UUID-based (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- [ ] Custom format: **\*\***\_\_\_**\*\***

### 3. Commission Timing

**Q: When should commissions be awarded?**

- [✅ ] Immediately when payment succeeds
- [ ] After a grace period (e.g., 7 days for refunds)
- [ ] Monthly batch processing

### 4. Recurring Commissions

**Q: Should referrers get commission on recurring payments?**

- [ ] Only first payment (one-time)
- [ ] Every recurring payment (ongoing)
- [ ✅] First payment + 3 months (e.g., first 3 months)

### 5. Minimum Payout

**Q: If using cash payouts, minimum threshold?**

- [✅] No minimum
- [ ] $10 minimum
- [ ] $25 minimum
- [ ] Other: **\*\***\_\_\_**\*\***


### 7. Referral Expiration

**Q: Should referral links expire?**

- [✅ ] Never expire
- [ ] Expire after X days/months: **\*\***\_\_\_**\*\***
- [ ] Expire after referee signs up (one-time use)

### 8. Dashboard Location

**Q: Where should the referral dashboard be?**

- [ ✅] New page: `/dashboard/referrals`
- [ ] Tab in existing billing page
- [ ] Section in user profile/settings

### 9. Analytics & Tracking

**Q: What metrics should be tracked?**

- [ ] Total referrals sent
- [ ] Successful signups
- [ ] Completed purchases
- [ ] Total earnings
- [ ] Conversion rate
- [ ✅] All of the above

### 10. Email Notifications

**Q: Should referrers get notified?**

- [ ] When someone signs up via their link
- [ ] When someone purchases a plan
- [ ] When commission is paid
- [ ✅] All of the above
- [ ] None (dashboard only)

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

- [ ] Create database tables
- [ ] Generate referral codes for existing users
- [ ] Add referral code to signup flow
- [ ] Basic referral tracking

### Phase 2: Commission System (Week 2)

- [ ] Commission calculation logic
- [ ] Credit awarding system
- [ ] Commission history tracking

### Phase 3: Dashboard & UI (Week 3)

- [ ] Referral dashboard page
- [ ] Share functionality
- [ ] Earnings display
- [ ] Referral list view

### Phase 4: Polish & Testing (Week 4)

- [ ] Security validation
- [ ] Edge case handling
- [ ] UI/UX improvements
- [ ] Testing & bug fixes

---

## Next Steps

1. **Answer the questions above** so I can finalize the implementation
2. **Review this plan** and suggest any changes
3. **Start with Phase 1** once approved

Let me know your preferences and I'll begin implementation!


also implement a system to send an email to info@yetti.ai when someone wants to cashout their earnings 

