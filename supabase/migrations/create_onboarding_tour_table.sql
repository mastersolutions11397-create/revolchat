-- Create user_onboarding_tour table for tracking first-time user tour progress
-- This table stores the state of the interactive onboarding tour for each user

CREATE TABLE IF NOT EXISTS public.user_onboarding_tour (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tour_status TEXT NOT NULL DEFAULT 'not_started' 
        CHECK (tour_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    current_step INTEGER DEFAULT 0,
    steps_completed INTEGER[] DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_tour_user_id 
    ON user_onboarding_tour(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_tour_status 
    ON user_onboarding_tour(tour_status);

-- Enable Row Level Security
ALTER TABLE public.user_onboarding_tour ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own tour data
DROP POLICY IF EXISTS "Users can view their own tour status" ON public.user_onboarding_tour;
CREATE POLICY "Users can view their own tour status" 
    ON public.user_onboarding_tour
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tour status" ON public.user_onboarding_tour;
CREATE POLICY "Users can insert their own tour status" 
    ON public.user_onboarding_tour
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tour status" ON public.user_onboarding_tour;
CREATE POLICY "Users can update their own tour status" 
    ON public.user_onboarding_tour
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on record updates
DROP TRIGGER IF EXISTS update_user_onboarding_tour_updated_at ON public.user_onboarding_tour;
CREATE TRIGGER update_user_onboarding_tour_updated_at 
    BEFORE UPDATE ON public.user_onboarding_tour
    FOR EACH ROW 
    EXECUTE FUNCTION update_onboarding_tour_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.user_onboarding_tour IS 'Tracks the progress of the interactive onboarding tour for first-time users';
COMMENT ON COLUMN public.user_onboarding_tour.tour_status IS 'Current status of the tour: not_started, in_progress, completed, or skipped';
COMMENT ON COLUMN public.user_onboarding_tour.current_step IS 'The index of the current step in the tour (0-indexed)';
COMMENT ON COLUMN public.user_onboarding_tour.steps_completed IS 'Array of step indices that have been completed';
