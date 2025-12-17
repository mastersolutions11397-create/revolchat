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

interface OnboardingTourContextType {
  // Tour state
  tourActive: boolean;
  currentStepIndex: number;
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
  const [tourStatus, setTourStatus] = useState<TourStatus>("not_started");
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);
  const [tourData, setTourData] = useState<OnboardingTourData | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // Total number of steps in the tour
  const TOTAL_STEPS = 5;

  // Load tour status when user is available
  useEffect(() => {
    if (!user?.id || isInitialized.current) return;

    const loadTourStatus = async () => {
      try {
        setLoading(true);
        const data = await tourAPI.getTourStatus(user.id);

        if (data) {
          setTourData(data);
          setTourStatus(data.tour_status);
          setCurrentStepIndex(data.current_step);
          setStepsCompleted(data.steps_completed || []);

          // Automatically activate tour if in_progress
          if (data.tour_status === "in_progress") {
            setTourActive(true);
          }
          // Auto-start tour if not started and user is new
          else if (data.tour_status === "not_started") {
            // We'll auto-start from the dashboard page
            setTourActive(false);
          }
        } else {
          // Create initial tour record for new user
          const newTourData = await tourAPI.createTourStatus({
            user_id: user.id,
            tour_status: "not_started",
          });
          setTourData(newTourData);
          setTourStatus("not_started");
        }

        isInitialized.current = true;
      } catch (error) {
        console.error("Error loading tour status:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTourStatus();
  }, [user?.id]);

  // Start the tour
  const startTour = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await tourAPI.startTour(user.id);
      setTourData(data);
      setTourStatus("in_progress");
      setTourActive(true);
      setCurrentStepIndex(0);
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

  // Move to next step
  const nextStep = useCallback(() => {
    if (currentStepIndex < TOTAL_STEPS - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Update database
      if (user?.id) {
        tourAPI
          .updateTourStep(user.id, {
            current_step: nextIndex,
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
          });
      }
    } else {
      // Last step completed
      completeTour();
    }
  }, [currentStepIndex, TOTAL_STEPS, user?.id, completeTour]);

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

  // Callback for workspace creation (Step 1 -> Step 2)
  const onWorkspaceCreated = useCallback(() => {
    if (tourActive && currentStepIndex === 0) {
      markStepCompleted(0);
      nextStep();
    }
  }, [tourActive, currentStepIndex, markStepCompleted, nextStep]);

  // Callback for onboarding modal completion (Step 2 -> Step 3)
  const onOnboardingModalCompleted = useCallback(() => {
    if (tourActive && currentStepIndex === 1) {
      markStepCompleted(1);
      nextStep();
    }
  }, [tourActive, currentStepIndex, markStepCompleted, nextStep]);

  // Callback for knowledge base navigation (Step 3 -> Step 4)
  const onNavigateToKnowledgeBase = useCallback(() => {
    if (tourActive && currentStepIndex === 2) {
      markStepCompleted(2);
      nextStep();
    }
  }, [tourActive, currentStepIndex, markStepCompleted, nextStep]);

  // Callback for integrations navigation (Step 4 -> Step 5)
  const onNavigateToIntegrations = useCallback(() => {
    if (tourActive && currentStepIndex === 3) {
      markStepCompleted(3);
      nextStep();
    }
  }, [tourActive, currentStepIndex, markStepCompleted, nextStep]);

  // Callback for settings navigation (Step 5 -> Complete)
  const onNavigateToSettings = useCallback(() => {
    if (tourActive && currentStepIndex === 4) {
      markStepCompleted(4);
      completeTour();
    }
  }, [tourActive, currentStepIndex, markStepCompleted, completeTour]);

  const value: OnboardingTourContextType = {
    tourActive,
    currentStepIndex,
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
