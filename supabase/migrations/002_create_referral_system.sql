-- Create referral system tables
-- This migration creates tables for tracking referrals and commissions

-- 1. Create user_profiles table for referral codes and stats
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    referral_code TEXT UNIQUE NOT NULL,
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL, -- The code that was used
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referee_id), -- A user can only be referred once
    CONSTRAINT no_self_referral CHECK (referrer_id != referee_id)
);

-- 3. Create referral_commissions table to track commission payments
CREATE TABLE IF NOT EXISTS public.referral_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    plan_price DECIMAL(10, 2) NOT NULL, -- Original plan price
    commission_amount DECIMAL(10, 2) NOT NULL, -- 30% of plan price
    commission_type TEXT NOT NULL DEFAULT 'cash' CHECK (commission_type IN ('credits', 'cash', 'pending')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'requested')),
    stripe_invoice_id TEXT, -- Link to Stripe invoice for tracking
    user_plan_id UUID REFERENCES user_plans(id), -- Link to the purchased plan
    payment_month INTEGER NOT NULL DEFAULT 1, -- Track which month (1 = first payment, 2-3 = recurring)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    cashout_requested_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create referral_cashout_requests table
CREATE TABLE IF NOT EXISTS public.referral_cashout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    commission_ids UUID[] NOT NULL, -- Array of commission IDs being cashed out
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    payment_method TEXT, -- e.g., 'paypal', 'bank_transfer', 'stripe'
    payment_details JSONB, -- Store payment info (account number, email, etc.)
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON referral_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_plan ON referral_commissions(user_plan_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referee ON referral_commissions(referee_id);
CREATE INDEX IF NOT EXISTS idx_cashout_requests_user ON referral_cashout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cashout_requests_status ON referral_cashout_requests(status);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_cashout_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referrals
DROP POLICY IF EXISTS "Users can view referrals they made" ON public.referrals;
CREATE POLICY "Users can view referrals they made" 
    ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can view referrals about them" ON public.referrals;
CREATE POLICY "Users can view referrals about them" 
    ON public.referrals
    FOR SELECT USING (auth.uid() = referee_id);

DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
CREATE POLICY "System can insert referrals" 
    ON public.referrals
    FOR INSERT WITH CHECK (true); -- Will be controlled by backend API

-- RLS Policies for referral_commissions
DROP POLICY IF EXISTS "Users can view their own commissions" ON public.referral_commissions;
CREATE POLICY "Users can view their own commissions" 
    ON public.referral_commissions
    FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "System can insert commissions" ON public.referral_commissions;
CREATE POLICY "System can insert commissions" 
    ON public.referral_commissions
    FOR INSERT WITH CHECK (true); -- Will be controlled by backend API

DROP POLICY IF EXISTS "System can update commissions" ON public.referral_commissions;
CREATE POLICY "System can update commissions" 
    ON public.referral_commissions
    FOR UPDATE USING (true); -- Will be controlled by backend API

-- RLS Policies for referral_cashout_requests
DROP POLICY IF EXISTS "Users can view their own cashout requests" ON public.referral_cashout_requests;
CREATE POLICY "Users can view their own cashout requests" 
    ON public.referral_cashout_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own cashout requests" ON public.referral_cashout_requests;
CREATE POLICY "Users can create their own cashout requests" 
    ON public.referral_cashout_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET total_referrals = COALESCE(total_referrals, 0) + 1
    WHERE user_profiles.user_id = increment_referral_count.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment referral earnings
CREATE OR REPLACE FUNCTION increment_referral_earnings(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET total_earnings = COALESCE(total_earnings, 0) + amount
    WHERE user_profiles.user_id = increment_referral_earnings.user_id;
END;
$$ LANGUAGE plpgsql;

