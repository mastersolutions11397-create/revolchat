-- Execute this SQL in your Supabase SQL Editor

-- Create user_plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID NOT NULL,
    plan_name TEXT NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, workspace_id)
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    credits INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    description TEXT,
    source TEXT,
    invoice TEXT, -- URL for credit transactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credits_workspace_user ON user_credits(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_created_at ON user_credits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_workspace ON user_plans(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_subscription ON user_plans(stripe_subscription_id);

-- Enable Row Level Security
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
CREATE POLICY "Users can view their own plans" ON public.user_plans
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own plans" ON public.user_plans;
CREATE POLICY "Users can insert their own plans" ON public.user_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own plans" ON public.user_plans;
CREATE POLICY "Users can update their own plans" ON public.user_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;
CREATE POLICY "Users can insert their own credits" ON public.user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_plans_updated_at ON public.user_plans;
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON public.user_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle credit balance calculation
CREATE OR REPLACE FUNCTION calculate_credit_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER := 0;
BEGIN
    -- Get the most recent balance for this workspace/user combination
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_credits
    WHERE workspace_id = NEW.workspace_id AND user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Calculate new balance
    IF NEW.transaction_type = 'credit' THEN
        NEW.balance := current_balance + NEW.credits;
    ELSE
        NEW.balance := current_balance - NEW.credits;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate balance
DROP TRIGGER IF EXISTS calculate_credit_balance_trigger ON public.user_credits;
CREATE TRIGGER calculate_credit_balance_trigger
    BEFORE INSERT ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION calculate_credit_balance();

-- Function to award initial credits when user is created
CREATE OR REPLACE FUNCTION award_initial_credits()
RETURNS TRIGGER AS $$
DECLARE
    default_workspace_id UUID;
BEGIN
    -- Try to find an existing workspace for this user
    SELECT id INTO default_workspace_id
    FROM public.workspaces
    WHERE user_id = NEW.id
    LIMIT 1;

    -- If no workspace exists, create a default one
    IF default_workspace_id IS NULL THEN
        INSERT INTO public.workspaces (user_id, name, workspace_type, created_at, updated_at)
        VALUES (NEW.id, 'Default Workspace', 'personal', NOW(), NOW())
        RETURNING id INTO default_workspace_id;
    END IF;

    -- Insert initial credit transaction
    INSERT INTO public.user_credits (
        workspace_id,
        user_id,
        transaction_type,
        credits,
        balance,
        description,
        source
    ) VALUES (
        default_workspace_id,
        NEW.id,
        'credit',
        100,
        100,
        'Welcome bonus credits',
        'user_registration'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award credits on user creation
DROP TRIGGER IF EXISTS award_initial_credits_trigger ON auth.users;
CREATE TRIGGER award_initial_credits_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION award_initial_credits();