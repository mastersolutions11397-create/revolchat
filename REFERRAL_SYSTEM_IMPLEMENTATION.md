# Referral System Implementation Summary

## ✅ Completed Components

### 1. Database Schema
- ✅ Created migration: `supabase/migrations/002_create_referral_system.sql`
- ✅ Tables created:
  - `user_profiles` - Stores referral codes and stats
  - `referrals` - Tracks referral relationships
  - `referral_commissions` - Tracks commission payments
  - `referral_cashout_requests` - Tracks cashout requests

### 2. Core Utilities
- ✅ `lib/utils/referral-code.ts` - Referral code generation (username-based format)
- ✅ `lib/api/referrals.ts` - API client for referrals

### 3. API Endpoints
- ✅ `app/api/referrals/link/route.ts` - Link referral code to user after signup
- ✅ `app/api/referrals/process-commission/route.ts` - Process commissions (internal)
- ✅ `app/api/referrals/profile/route.ts` - Get/create user referral profile
- ✅ `app/api/referrals/cashout/route.ts` - Create cashout request + email to info@yetti.ai

### 4. Signup Integration
- ✅ Updated `app/auth/signup/page.tsx` to capture referral code from URL (`?ref=CODE`)
- ✅ Stores referral code in localStorage as backup
- ✅ Automatically links referral after successful signup

### 5. Stripe Webhook Integration
- ✅ Updated `app/api/stripe/webhook/route.ts` to process referral commissions
- ✅ Calculates 30% commission on plan purchases
- ✅ Handles recurring commissions for first 3 months
- ✅ Sends email notifications to referrers when commissions are earned

### 6. Scripts
- ✅ `scripts/generate-referral-codes.ts` - Generate referral codes for existing users

## 🚧 Remaining Tasks

### 1. API Endpoints (Need Backend Implementation)
These endpoints currently use direct Supabase access but should call the backend API:
- `GET /api/referrals/analytics` - Get referral statistics
- `GET /api/referrals/list` - Get list of referrals
- `GET /api/referrals/commissions` - Get commission history
- `GET /api/referrals/cashout-requests` - Get cashout requests

**Note:** According to the plan, these should call the backend API at `http://localhost:8000/api/referrals/...` instead of direct Supabase access.

### 2. Referral Dashboard
- ⏳ Create `app/dashboard/referrals/page.tsx`
- Features needed:
  - Display referral code and shareable link
  - Copy link button
  - Analytics dashboard (total referrals, earnings, conversion rate)
  - List of referrals (pending/completed)
  - Commission history table
  - Cashout request form
  - Earnings summary

### 3. Email Notifications
- ✅ Commission earned emails (implemented in webhook)
- ⏳ Email when someone signs up via referral link
- ⏳ Email when someone purchases a plan (already done in commission email)

### 4. Additional Features
- ⏳ Add referral link to navigation/sidebar
- ⏳ Add referral stats widget to dashboard
- ⏳ Admin panel for processing cashouts

## 📋 Setup Instructions

### 1. Run Database Migration
Execute the SQL migration in your Supabase SQL Editor:
```sql
-- Run: supabase/migrations/002_create_referral_system.sql
```

### 2. Generate Referral Codes for Existing Users
```bash
npx tsx scripts/generate-referral-codes.ts
```

### 3. Environment Variables
Ensure these are set:
```env
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SITE_URL=https://yetti.ai
```

### 4. Test Referral Flow
1. Sign up with referral link: `https://yetti.ai/auth/signup?ref=USER-ABC123`
2. Purchase a plan
3. Check that commission is created
4. Check email notification

## 🔧 Backend API Requirements

The following endpoints need to be implemented in the backend API (`http://localhost:8000`):

```
GET  /api/referrals/profile          - Get user referral profile
GET  /api/referrals/analytics        - Get referral analytics
GET  /api/referrals/list             - Get list of referrals
GET  /api/referrals/commissions      - Get commission history
POST /api/referrals/cashout          - Create cashout request
GET  /api/referrals/cashout-requests - Get cashout requests
```

These should replace the direct Supabase calls in the Next.js API routes.

## 📝 Notes

- Referral codes are username-based (e.g., `AFFAN-7X9K2`)
- Commissions are 30% of plan price
- Commissions are paid for first 3 months of subscription
- Cash payouts (not credits)
- No minimum payout threshold
- Email sent to info@yetti.ai when cashout is requested
- Referral links never expire

