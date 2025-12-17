/**
 * API functions for managing the onboarding tour state
 * Handles CRUD operations for user_onboarding_tour table
 */

import { supabase } from "@/lib/supabase";

export type TourStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export interface OnboardingTourData {
  id: string;
  user_id: string;
  tour_status: TourStatus;
  current_step: number;
  steps_completed: number[];
  started_at: string | null;
  completed_at: string | null;
  skipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTourStatusParams {
  user_id: string;
  tour_status?: TourStatus;
  current_step?: number;
}

export interface UpdateTourStepParams {
  current_step: number;
  steps_completed?: number[];
}

/**
 * Get the tour status for a specific user
 */
export async function getTourStatus(
  userId: string
): Promise<OnboardingTourData | null> {
  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching tour status:", error);
    throw new Error(`Failed to fetch tour status: ${error.message}`);
  }

  return data;
}

/**
 * Create a new tour status record for a user
 * Returns the created record or existing record if already exists
 */
export async function createTourStatus(
  params: CreateTourStatusParams
): Promise<OnboardingTourData> {
  const { user_id, tour_status = "not_started", current_step = 0 } = params;

  // First check if record already exists
  const existing = await getTourStatus(user_id);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .insert({
      user_id,
      tour_status,
      current_step,
      steps_completed: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tour status:", error);
    throw new Error(`Failed to create tour status: ${error.message}`);
  }

  return data;
}

/**
 * Start the tour for a user (marks it as in_progress)
 */
export async function startTour(userId: string): Promise<OnboardingTourData> {
  // Get or create tour record
  let tourData = await getTourStatus(userId);

  if (!tourData) {
    tourData = await createTourStatus({ user_id: userId });
  }

  // Update to in_progress if not already started
  if (tourData.tour_status === "not_started") {
    const { data, error } = await supabase
      .from("user_onboarding_tour")
      .update({
        tour_status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error starting tour:", error);
      throw new Error(`Failed to start tour: ${error.message}`);
    }

    return data;
  }

  return tourData;
}

/**
 * Update the current step and optionally mark steps as completed
 */
export async function updateTourStep(
  userId: string,
  params: UpdateTourStepParams
): Promise<OnboardingTourData> {
  const { current_step, steps_completed } = params;

  const updateData: any = {
    current_step,
  };

  if (steps_completed !== undefined) {
    updateData.steps_completed = steps_completed;
  }

  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating tour step:", error);
    throw new Error(`Failed to update tour step: ${error.message}`);
  }

  return data;
}

/**
 * Mark the tour as completed
 */
export async function completeTour(
  userId: string
): Promise<OnboardingTourData> {
  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .update({
      tour_status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error completing tour:", error);
    throw new Error(`Failed to complete tour: ${error.message}`);
  }

  return data;
}

/**
 * Skip the tour permanently
 */
export async function skipTour(userId: string): Promise<OnboardingTourData> {
  // Get or create tour record
  let tourData = await getTourStatus(userId);

  if (!tourData) {
    tourData = await createTourStatus({
      user_id: userId,
      tour_status: "skipped",
    });
  }

  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .update({
      tour_status: "skipped",
      skipped_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error skipping tour:", error);
    throw new Error(`Failed to skip tour: ${error.message}`);
  }

  return data;
}

/**
 * Check if the tour should be shown to the user
 * Returns true if tour is not_started or in_progress
 */
export async function shouldShowTour(userId: string): Promise<boolean> {
  const tourData = await getTourStatus(userId);

  if (!tourData) {
    // No record means user hasn't seen tour yet
    return true;
  }

  return (
    tourData.tour_status === "not_started" ||
    tourData.tour_status === "in_progress"
  );
}

/**
 * Reset the tour for a user (useful for testing or if user wants to restart)
 */
export async function resetTour(userId: string): Promise<OnboardingTourData> {
  const { data, error } = await supabase
    .from("user_onboarding_tour")
    .update({
      tour_status: "not_started",
      current_step: 0,
      steps_completed: [],
      started_at: null,
      completed_at: null,
      skipped_at: null,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error resetting tour:", error);
    throw new Error(`Failed to reset tour: ${error.message}`);
  }

  return data;
}
