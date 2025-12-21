"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/lib/auth-context";
import * as tourAPI from "@/lib/api/onboarding-tour";
import type { TourStatus, OnboardingTourData } from "@/lib/api/onboarding-tour";
import { TOUR_STEPS } from "@/lib/tour/steps";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { yettiOnboardingAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface OnboardingTourContextType {
  // Tour state
  tourActive: boolean;
  currentStepIndex: number;
  currentSubStepIndex: number; // Track sub-steps within main steps
  tourStatus: TourStatus;
  stepsCompleted: number[];
  loading: boolean;

  // Tour actions
  startTour: () => Promise<void>;
  skipTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  goToStep: (stepIndex: number) => void;
  markStepCompleted: (stepIndex: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;

  // Callbacks for specific actions
  onWorkspaceCreated: () => void;
  onOnboardingModalCompleted: () => void;
  onNavigateToKnowledgeBase: () => void;
  onKnowledgeBaseCompleted: () => void;
  onNavigateToIntegrations: () => void;
  onNavigateToSettings: () => void;

  // Tour data
  tourData: OnboardingTourData | null;
}

const OnboardingTourContext = createContext<
  OnboardingTourContextType | undefined
>(undefined);

export function OnboardingTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { currentWorkspace, hasWorkspaces } = useWorkspace();
  const [tourActive, setTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [tourStatus, setTourStatus] = useState<TourStatus>("not_started");
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);
  const [tourData, setTourData] = useState<OnboardingTourData | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const hasUpdatedTourForWorkspace = useRef(false);

  // Log when currentStepIndex changes
  useEffect(() => {
    console.log("Tour step changed to:", currentStepIndex);
  }, [currentStepIndex]);

  // Total number of steps in the tour
  const TOTAL_STEPS = 6;

  // Load tour status when user is available
  useEffect(() => {
    if (!user?.id || isInitialized.current) return;

    const loadTourStatus = async () => {
      try {
        setLoading(true);
        console.log("Loading tour status for user:", user.id);
        const data = await tourAPI.getTourStatus(user.id);
        console.log("Tour status data:", data);

        if (data) {
          setTourData(data);
          setTourStatus(data.tour_status);
          setCurrentStepIndex(data.current_step);
          setStepsCompleted(data.steps_completed || []);

          // Automatically activate tour if in_progress
          if (data.tour_status === "in_progress") {
            console.log("Tour is in_progress, activating tour");
            setTourActive(true);
          }
          // Auto-start tour if not started and user is new
          else if (data.tour_status === "not_started") {
            console.log(
              "Tour is not_started, waiting for dashboard to auto-start"
            );
            // We'll auto-start from the dashboard page
            setTourActive(false);
          }
        } else {
          console.log("No tour data found, creating new tour record");
          // Create initial tour record for new user
          const newTourData = await tourAPI.createTourStatus({
            user_id: user.id,
            tour_status: "not_started",
          });
          console.log("New tour record created:", newTourData);
          setTourData(newTourData);
          setTourStatus("not_started");
        }

        isInitialized.current = true;
      } catch (error) {
        console.error("Error loading tour status:", error);
        // Set a default state so the app doesn't break
        console.log("Setting default tour state due to error");
        setTourStatus("not_started");
        setTourData(null);
        isInitialized.current = true;
      } finally {
        setLoading(false);
        console.log("Tour status loading completed");
      }
    };

    loadTourStatus();
  }, [user?.id]);

  // Reset the update flag when workspace changes
  useEffect(() => {
    hasUpdatedTourForWorkspace.current = false;
  }, [currentWorkspace?.id]);

  // Check if workspace exists and update tour accordingly
  useEffect(() => {
    if (!user?.id || !hasWorkspaces || !currentWorkspace) return;
    if (!tourData) return;
    
    // If workspace exists and tour is not_started, update to in_progress with step 1
    if (tourStatus === "not_started" && !hasUpdatedTourForWorkspace.current) {
      hasUpdatedTourForWorkspace.current = true;
      const updateTourForExistingWorkspace = async () => {
        try {
          console.log("Workspace found with tour not_started. Updating to in_progress, current_step=1, steps_completed=[1]");
          
          // First, update tour status to in_progress
          const { data: updatedStatus, error: statusError } = await supabase
            .from("user_onboarding_tour")
            .update({
              tour_status: "in_progress",
              started_at: new Date().toISOString(),
              current_step: 1,
              steps_completed: [1],
            })
            .eq("user_id", user.id)
            .select()
            .single();

          if (statusError) {
            console.error("Error updating tour status:", statusError);
            hasUpdatedTourForWorkspace.current = false; // Reset on error
            throw statusError;
          }

          if (updatedStatus) {
            setTourData(updatedStatus);
            setTourStatus("in_progress");
            setTourActive(true);
            setCurrentStepIndex(1);
            setStepsCompleted([1]);
            console.log("Tour updated: status=in_progress, current_step=1, steps_completed=[1]");
          }
        } catch (error) {
          console.error("Error updating tour for existing workspace:", error);
          hasUpdatedTourForWorkspace.current = false; // Reset on error
        }
      };

      updateTourForExistingWorkspace();
      return;
    }
    
    // If tour is in_progress, current_step is 0, and steps_completed is empty, update to step 1
    if (tourStatus === "in_progress") {
      if (tourData.current_step === 0 && (!tourData.steps_completed || tourData.steps_completed.length === 0)) {
        const updateTourForExistingWorkspace = async () => {
          try {
            console.log("Workspace found with tour in_progress, current_step=0, steps_completed=[]. Updating to step 1");
            const updatedData = await tourAPI.updateTourStep(user.id, {
              current_step: 1,
              steps_completed: [0],
            });
            setTourData(updatedData);
            setCurrentStepIndex(1);
            setStepsCompleted([0]);
            console.log("Tour updated: current_step=1, steps_completed=[0]");
          } catch (error) {
            console.error("Error updating tour for existing workspace:", error);
          }
        };

        updateTourForExistingWorkspace();
      }
    }
  }, [user?.id, hasWorkspaces, currentWorkspace, tourStatus, tourData]);

  // Start the tour
  const startTour = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot start tour: no user ID");
      return;
    }

    console.log("Starting tour for user:", user.id);
    try {
      const data = await tourAPI.startTour(user.id);
      console.log("Tour started, data:", data);
      setTourData(data);
      setTourStatus("in_progress");
      setTourActive(true);
      setCurrentStepIndex(0);
      console.log("Tour state updated: tourActive=true, currentStepIndex=0");
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  }, [user?.id]);

  // Skip the tour permanently
  const skipTour = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await tourAPI.skipTour(user.id);
      setTourData(data);
      setTourStatus("skipped");
      setTourActive(false);
    } catch (error) {
      console.error("Error skipping tour:", error);
    }
  }, [user?.id]);

  // Complete the tour
  const completeTour = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await tourAPI.completeTour(user.id);
      setTourData(data);
      setTourStatus("completed");
      setTourActive(false);
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  }, [user?.id]);

  // Go to a specific step
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < TOTAL_STEPS) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [TOTAL_STEPS]
  );

  // Mark a step as completed
  const markStepCompleted = useCallback(
    async (stepIndex: number) => {
      if (!user?.id) return;

      const newStepsCompleted = [...new Set([...stepsCompleted, stepIndex])];
      setStepsCompleted(newStepsCompleted);

      try {
        await tourAPI.updateTourStep(user.id, {
          current_step: currentStepIndex,
          steps_completed: newStepsCompleted,
        });
      } catch (error) {
        console.error("Error marking step completed:", error);
      }
    },
    [user?.id, currentStepIndex, stepsCompleted]
  );

  // Move to next step (or sub-step)
  const nextStep = useCallback(async () => {
    console.log("nextStep() called:", {
      currentStepIndex,
      currentSubStepIndex,
      maxSteps: TOTAL_STEPS - 1,
      canAdvance: currentStepIndex < TOTAL_STEPS - 1,
    });

    // Find current step to check for onNext action
    const currentStep = TOUR_STEPS.find(
      (s) => s.stepIndex === currentStepIndex && s.subStepIndex === currentSubStepIndex
    );

    // Perform action before advancing (e.g., navigate, click button)
    if (currentStep?.onNext) {
      console.log("Performing onNext action for step:", currentStepIndex, currentSubStepIndex);
      try {
        await currentStep.onNext();
        // Small delay to allow navigation/action to complete
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Error performing onNext action:", error);
      }
    }

    // Check if there are more sub-steps for current step
    const stepsForCurrentIndex = TOUR_STEPS.filter((s) => s.stepIndex === currentStepIndex);
    const maxSubStep = Math.max(...stepsForCurrentIndex.map((s) => s.subStepIndex || 0));
    
    if (currentSubStepIndex < maxSubStep) {
      // Advance to next sub-step
      const nextSubStep = currentSubStepIndex + 1;
      console.log("Advancing to sub-step:", nextSubStep);
      setCurrentSubStepIndex(nextSubStep);

      // Update database with current step (sub-step doesn't change main step index)
      if (user?.id) {
        const updatedStepsCompleted = [...new Set([...stepsCompleted, currentStepIndex])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: currentStepIndex,
            steps_completed: updatedStepsCompleted,
          })
          .then(() => {
            console.log("Database updated with step:", currentStepIndex, "steps_completed:", updatedStepsCompleted);
            setStepsCompleted(updatedStepsCompleted);
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    } else if (currentStepIndex < TOTAL_STEPS - 1) {
      // Advance to next main step
      const nextIndex = currentStepIndex + 1;
      console.log("Advancing to step:", nextIndex);
      setCurrentStepIndex(nextIndex);
      setCurrentSubStepIndex(0); // Reset sub-step for new main step

      // Update database
      if (user?.id) {
        // Mark previous step as completed
        const updatedStepsCompleted = [...new Set([...stepsCompleted, currentStepIndex])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: nextIndex,
            steps_completed: updatedStepsCompleted,
          })
          .then(() => {
            console.log("Database updated with new step:", nextIndex, "steps_completed:", updatedStepsCompleted);
            setStepsCompleted(updatedStepsCompleted);
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    } else if (currentStepIndex >= TOTAL_STEPS - 1) {
      // Last step completed (step 5 - Thank You)
      console.log("Last step reached, completing tour");
      // Update database to mark final step as completed
      if (user?.id) {
        const finalStepsCompleted = [...new Set([...stepsCompleted, currentStepIndex])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: currentStepIndex,
            steps_completed: finalStepsCompleted,
          })
          .then(() => {
            console.log("Final step saved to database");
            // Complete the tour immediately when Finish button is clicked
            completeTour();
          })
          .catch((error) => {
            console.error("Error updating final tour step:", error);
            // Still complete tour even if database update fails
            completeTour();
          });
      } else {
        // Complete tour even without user ID
        completeTour();
      }
    }
  }, [currentStepIndex, currentSubStepIndex, TOTAL_STEPS, user?.id, completeTour, stepsCompleted]);

  // Move to previous step
  const prevStep = useCallback(async () => {
    console.log("prevStep() called:", {
      currentStepIndex,
      currentSubStepIndex,
    });

    // If we're on a sub-step > 0, go to previous sub-step
    if (currentSubStepIndex > 0) {
      const prevSubStep = currentSubStepIndex - 1;
      console.log("Going to previous sub-step:", prevSubStep);
      setCurrentSubStepIndex(prevSubStep);
      // Don't update database for sub-step changes, only for main step changes
      return;
    }

    // If we're on sub-step 0, go to previous main step
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      console.log("Going to previous main step:", prevIndex);

      // Go to sub-step 0 of the previous main step
      setCurrentStepIndex(prevIndex);
      setCurrentSubStepIndex(0);

      // Remove the last step from steps_completed array
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== currentStepIndex
      );

      // Update database with current_step - 1 and updated steps_completed
      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: prevIndex,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated on back button:", {
            current_step: prevIndex,
            steps_completed: updatedStepsCompleted,
          });
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
    }
  }, [currentStepIndex, currentSubStepIndex, user?.id, stepsCompleted]);

  // Callback for workspace creation (Step 0, sub-step 0 -> sub-step 1)
  const onWorkspaceCreated = useCallback(() => {
    if (tourActive && currentStepIndex === 0) {
      // Advance to onboarding modal sub-step instead of next main step
      setCurrentSubStepIndex(1);
    }
  }, [tourActive, currentStepIndex]);

  // Callback for onboarding modal completion (Step 0, sub-step 1 -> Step 1)
  const onOnboardingModalCompleted = useCallback(() => {
    if (tourActive && currentStepIndex === 0 && currentSubStepIndex === 1) {
      markStepCompleted(0);
      // Advance to next main step (Knowledge Base)
      setCurrentStepIndex(1);
      setCurrentSubStepIndex(0);
      
      // Update database
      if (user?.id) {
        tourAPI
          .updateTourStep(user.id, {
            current_step: 1,
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    }
  }, [tourActive, currentStepIndex, currentSubStepIndex, markStepCompleted, user?.id]);

  // Callback for knowledge base navigation (Step 1 - just navigate, don't advance)
  const onNavigateToKnowledgeBase = useCallback(() => {
    console.log("onNavigateToKnowledgeBase called", {
      tourActive,
      currentStepIndex,
    });
    // Just navigate to knowledge base, stay on step 1 for sub-steps
    // Step will advance when knowledge is saved (handled by save button interaction)
  }, []);

  // Callback for knowledge base completion - advance to Test Yetti sub-step
  const onKnowledgeBaseCompleted = useCallback(() => {
    if (tourActive && currentStepIndex === 1) {
      // Advance to Test Yetti sub-step (subStepIndex 4) instead of next main step
      setCurrentSubStepIndex(4);
    }
  }, [tourActive, currentStepIndex]);

  // Callback for integrations navigation (Step 2 - just navigate, don't auto-advance)
  const onNavigateToIntegrations = useCallback(() => {
    console.log("onNavigateToIntegrations called", {
      tourActive,
      currentStepIndex,
    });
    // Just navigate to integrations, stay on step 2
    // Step will advance when user clicks Next button
  }, []);

  // Callback for settings navigation (Step 3 - just navigate, don't advance)
  const onNavigateToSettings = useCallback(() => {
    console.log("onNavigateToSettings called", {
      tourActive,
      currentStepIndex,
    });
    // Just navigate to settings, stay on step 3
    // Step will complete when workspace hours are saved
  }, []);

  const value: OnboardingTourContextType = {
    tourActive,
    currentStepIndex,
    currentSubStepIndex,
    tourStatus,
    stepsCompleted,
    loading,
    startTour,
    skipTour,
    completeTour,
    goToStep,
    markStepCompleted,
    nextStep,
    prevStep,
    onWorkspaceCreated,
    onOnboardingModalCompleted,
    onNavigateToKnowledgeBase,
    onKnowledgeBaseCompleted,
    onNavigateToIntegrations,
    onNavigateToSettings,
    tourData,
  };

  return (
    <OnboardingTourContext.Provider value={value}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (context === undefined) {
    throw new Error(
      "useOnboardingTour must be used within an OnboardingTourProvider"
    );
  }
  return context;
}
