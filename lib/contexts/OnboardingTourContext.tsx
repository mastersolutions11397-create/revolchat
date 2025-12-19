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
  nextStep: () => void;
  prevStep: () => void;

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
  const [tourActive, setTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [tourStatus, setTourStatus] = useState<TourStatus>("not_started");
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);
  const [tourData, setTourData] = useState<OnboardingTourData | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // Log when currentStepIndex changes
  useEffect(() => {
    console.log("Tour step changed to:", currentStepIndex);
  }, [currentStepIndex]);

  // Total number of steps in the tour
  const TOTAL_STEPS = 4;

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
  const nextStep = useCallback(() => {
    console.log("nextStep() called:", {
      currentStepIndex,
      currentSubStepIndex,
      maxSteps: TOTAL_STEPS - 1,
      canAdvance: currentStepIndex < TOTAL_STEPS - 1,
    });

    // Check if there are more sub-steps for current step
    const stepsForCurrentIndex = TOUR_STEPS.filter((s) => s.stepIndex === currentStepIndex);
    const maxSubStep = Math.max(...stepsForCurrentIndex.map((s) => s.subStepIndex || 0));
    
    if (currentSubStepIndex < maxSubStep) {
      // Advance to next sub-step
      const nextSubStep = currentSubStepIndex + 1;
      console.log("Advancing to sub-step:", nextSubStep);
      setCurrentSubStepIndex(nextSubStep);
    } else if (currentStepIndex < TOTAL_STEPS - 1) {
      // Advance to next main step
      const nextIndex = currentStepIndex + 1;
      console.log("Advancing to step:", nextIndex);
      setCurrentStepIndex(nextIndex);
      setCurrentSubStepIndex(0); // Reset sub-step for new main step

      // Update database
      if (user?.id) {
        tourAPI
          .updateTourStep(user.id, {
            current_step: nextIndex,
          })
          .then(() => {
            console.log("Database updated with new step:", nextIndex);
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    } else {
      // Last step completed
      console.log("Last step reached, completing tour");
      completeTour();
    }
  }, [currentStepIndex, currentSubStepIndex, TOTAL_STEPS, user?.id, completeTour]);

  // Move to previous step
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);

      // Update database
      if (user?.id) {
        tourAPI
          .updateTourStep(user.id, {
            current_step: prevIndex,
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    }
  }, [currentStepIndex, user?.id]);

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

  // Callback for integrations navigation (Step 2 - auto-advance after 3 seconds)
  const onNavigateToIntegrations = useCallback(() => {
    console.log("onNavigateToIntegrations called", {
      tourActive,
      currentStepIndex,
    });
    // Auto-advance to next step after 3 seconds when user is on integrations page
    if (tourActive && currentStepIndex === 2) {
      setTimeout(() => {
        console.log("Auto-advancing from integrations page after 3 seconds");
        markStepCompleted(2);
        nextStep();
      }, 3000);
    }
  }, [tourActive, currentStepIndex, markStepCompleted, nextStep]);

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
