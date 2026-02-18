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
  onTestAgentMessageCompleted: () => void;
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
  const [testAgentMessageReceived, setTestAgentMessageReceived] = useState(false);
  const isInitialized = useRef(false);
  const hasUpdatedTourForWorkspace = useRef(false);
  const hasStartedTourForNoWorkspace = useRef(false);

  // Log when currentStepIndex changes
  useEffect(() => {
    console.log("Tour step changed to:", currentStepIndex);
  }, [currentStepIndex]);

  // Total number of steps in the tour
  // Note: Step 1.5 (test agent) and 1.7 (waiting for message) are included, so we have 0, 1, 1.5, 1.7, 2, 3, 4, 5 = 8 steps total
  const TOTAL_STEPS = 8;
  const TEST_AGENT_STEP = 1.5;
  const TEST_AGENT_WAIT_STEP = 1.7;

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
            // Ensure sub-step is also set correctly
            setCurrentSubStepIndex(0);
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

  // Reset the update flag when user changes
  useEffect(() => {
    hasUpdatedTourForWorkspace.current = false;
  }, [user?.id]);

  // Reset test agent message received flag when leaving step 1.5 and 1.7
  useEffect(() => {
    if (currentStepIndex !== TEST_AGENT_STEP && currentStepIndex !== TEST_AGENT_WAIT_STEP) {
      setTestAgentMessageReceived(false);
    }
  }, [currentStepIndex, TEST_AGENT_STEP, TEST_AGENT_WAIT_STEP]);

  // Ensure tour is activated when status becomes in_progress
  useEffect(() => {
    if (!loading && isInitialized.current && tourStatus === "in_progress" && !tourActive) {
      console.log("Tour status is in_progress but not active, activating now");
      setTourActive(true);
      // Ensure step indices are set correctly
      if (tourData) {
        setCurrentStepIndex(tourData.current_step);
        setCurrentSubStepIndex(0);
      }
    }
  }, [tourStatus, tourActive, loading, tourData]);

  // Check if user is onboarded and update tour accordingly
  useEffect(() => {
    if (!user?.id) return;
    if (!tourData) return;
    
    if (tourStatus === "not_started" && !hasUpdatedTourForWorkspace.current) {
      hasUpdatedTourForWorkspace.current = true;
      const updateTourForExistingWorkspace = async () => {
        try {
          const onboardingStatus = await yettiOnboardingAPI
            .getOnboardingStatus()
            .catch((err: unknown) => {
              if (
                err instanceof Error &&
                (err.message.includes("404") ||
                  err.message.toLowerCase().includes("not found"))
              ) {
                return null;
              }
              throw err;
            });

          // Only update tour if workspace is onboarded
          if (!onboardingStatus || !onboardingStatus.is_onboarded) {
            console.log("Workspace is not onboarded, skipping tour update");
            hasUpdatedTourForWorkspace.current = false; // Reset to allow retry
            return;
          }

          console.log("Workspace is onboarded. Updating tour to in_progress, current_step=1, steps_completed=[0]");
          
          // First, update tour status to in_progress
          const { data: updatedStatus, error: statusError } = await supabase
            .from("user_onboarding_tour")
            .update({
              tour_status: "in_progress",
              started_at: new Date().toISOString(),
              current_step: 1,
              steps_completed: [0],
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
            setStepsCompleted([0]);
            console.log("Tour updated: status=in_progress, current_step=1, steps_completed=[0]");
          }
        } catch (error) {
          console.error("Error updating tour for existing workspace:", error);
          hasUpdatedTourForWorkspace.current = false; // Reset on error
        }
      };

      updateTourForExistingWorkspace();
      return;
    }
    
    // If tour is in_progress, current_step is 0, and steps_completed is empty, check if workspace is onboarded before updating
    if (tourStatus === "in_progress") {
      if (tourData.current_step === 0 && (!tourData.steps_completed || tourData.steps_completed.length === 0)) {
        const updateTourForExistingWorkspace = async () => {
          try {
            // Check if workspace is onboarded
            const onboardingStatus = await yettiOnboardingAPI
              .getOnboardingStatus()
              .catch((err: unknown) => {
                if (
                  err instanceof Error &&
                  (err.message.includes("404") ||
                    err.message.toLowerCase().includes("not found"))
                ) {
                  return null;
                }
                throw err;
              });

            // Only update tour if workspace is onboarded
            if (!onboardingStatus || !onboardingStatus.is_onboarded) {
              console.log("Workspace is not onboarded, skipping tour update");
              return;
            }

            console.log("Workspace is onboarded. Updating tour to current_step=1, steps_completed=[0]");
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
  }, [user?.id, tourStatus, tourData]);

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

    // Special handling for step 1, sub-step 3 (Save button) - update to step 1.5
    if (currentStepIndex === 1 && currentSubStepIndex === 3) {
      console.log("Step 1, sub-step 3: Updating to step 1.5 in database");
      // Update to step 1.5 in database, but don't show it yet (wait for knowledge to be saved)
      setCurrentStepIndex(TEST_AGENT_STEP);
      setCurrentSubStepIndex(0);
      
      if (user?.id) {
        // Include step 1.5 in steps_completed (step 1 should already be in there)
        const updatedStepsCompleted = [...new Set([...stepsCompleted, 1, TEST_AGENT_STEP])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: TEST_AGENT_STEP,
            steps_completed: updatedStepsCompleted,
          })
          .then((data) => {
            console.log("Database updated to step 1.5, steps_completed:", updatedStepsCompleted);
            setTourData(data);
            setStepsCompleted(updatedStepsCompleted);
            // Hide the tour temporarily - it will show when knowledge is saved
            setTourActive(false);
          })
          .catch((error) => {
            console.error("Error updating to step 1.5:", error);
          });
      }
      return; // Don't show step 1.5 yet, wait for knowledge to be saved
    }

    // Special handling for step 1.5 (Test Agent) - advance to 1.7 when Next is clicked
    if (currentStepIndex === TEST_AGENT_STEP) {
      console.log("Step 1.5: Next clicked - advancing to step 1.7 and closing popup");
      // Close the tour popup so user can interact with chat
      setTourActive(false);
      // Advance to step 1.7 (waiting for message)
      setCurrentStepIndex(TEST_AGENT_WAIT_STEP);
      setCurrentSubStepIndex(0);
      
      if (user?.id) {
        // Mark step 1.7 as completed when advancing to it
        const updatedStepsCompleted = [...new Set([...stepsCompleted, TEST_AGENT_WAIT_STEP])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: TEST_AGENT_WAIT_STEP,
            steps_completed: updatedStepsCompleted,
          })
          .then((data) => {
            console.log("Database updated to step 1.7, steps_completed:", updatedStepsCompleted);
            setTourData(data);
            setStepsCompleted(updatedStepsCompleted);
          })
          .catch((error) => {
            console.error("Error updating tour step to 1.7:", error);
          });
      }
      return;
    }

    // Special handling for step 1.7 (Waiting for message) - advance to step 2 when message is received
    if (currentStepIndex === TEST_AGENT_WAIT_STEP) {
      if (!testAgentMessageReceived) {
        console.log("Step 1.7: No message received yet - waiting");
        // Keep tour closed, waiting for message
        return;
      }
      
      // Message has been received, advance to step 2
      console.log("Step 1.7: Message received, advancing to step 2 (Integrations)");
      markStepCompleted(TEST_AGENT_WAIT_STEP);
      setCurrentStepIndex(2);
      setCurrentSubStepIndex(0);
      
      if (user?.id) {
        const updatedStepsCompleted = [...new Set([...stepsCompleted, 2])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: 2,
            steps_completed: updatedStepsCompleted,
          })
          .then((data) => {
            console.log("Database updated to step 2, steps_completed:", updatedStepsCompleted);
            setTourData(data);
            setStepsCompleted(updatedStepsCompleted);
            // Re-activate tour for step 2
            setTourActive(true);
          })
          .catch((error) => {
            console.error("Error updating tour step to 2:", error);
            // Still re-activate tour even if database update fails
            setTourActive(true);
          });
      } else {
        // Re-activate tour even without user ID
        setTourActive(true);
      }
      return;
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
    } else if (currentStepIndex < TEST_AGENT_STEP) {
      // If we're before step 1.5, check if we should go to 1.5 or 2
      let nextIndex: number;
      if (currentStepIndex === 1) {
        // From step 1, go to step 1.5 (but this should be handled by onKnowledgeBaseCompleted)
        // So we shouldn't reach here, but just in case, go to 2
        nextIndex = 2;
      } else {
        nextIndex = currentStepIndex + 1;
      }
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
    } else if (currentStepIndex === TEST_AGENT_WAIT_STEP) {
      // Step 1.7 - handled separately above, should not reach here
      return;
    } else if (currentStepIndex > TEST_AGENT_WAIT_STEP && currentStepIndex < 5) {
      // Advance to next main step (for steps after 1.7, but before last step)
      // Step order: 0, 1, 1.5, 1.7, 2, 3, 4, 5
      let nextIndex: number;
      if (currentStepIndex === 2) {
        nextIndex = 3;
      } else if (currentStepIndex === 3) {
        nextIndex = 4;
      } else if (currentStepIndex === 4) {
        nextIndex = 5;
      } else {
        nextIndex = currentStepIndex + 1;
      }
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
    } else if (currentStepIndex === 5) {
      // Last step completed (step 5 - Thank You)
      // Note: Step indices are 0, 1, 1.5, 2, 3, 4, 5, so step 5 is the last
      console.log("Last step reached, completing tour");
      // Update database to mark final step as completed and set status to completed
      if (user?.id) {
        const finalStepsCompleted = [...new Set([...stepsCompleted, currentStepIndex])];
        // First update the step, then complete the tour
        tourAPI
          .updateTourStep(user.id, {
            current_step: currentStepIndex,
            steps_completed: finalStepsCompleted,
          })
          .then(() => {
            console.log("Final step saved to database, updating status to completed");
            // Complete the tour (this will update status to "completed")
            return completeTour();
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
  }, [currentStepIndex, currentSubStepIndex, TOTAL_STEPS, TEST_AGENT_STEP, TEST_AGENT_WAIT_STEP, user?.id, completeTour, stepsCompleted, markStepCompleted, testAgentMessageReceived]);

  // Move to previous step
  const prevStep = useCallback(async () => {
    console.log("prevStep() called:", {
      currentStepIndex,
      currentSubStepIndex,
      stepsCompleted,
    });

    // Helper function to get the last sub-step index for a given step
    const getLastSubStepIndex = (stepIdx: number): number => {
      const stepsForIndex = TOUR_STEPS.filter((s) => s.stepIndex === stepIdx);
      if (stepsForIndex.length === 0) return 0;
      return Math.max(...stepsForIndex.map((s) => s.subStepIndex || 0));
    };

    // Helper function to get the previous main step index
    // Step order: 0, 1, 1.5, 1.7, 2, 3, 4, 5
    const getPreviousMainStepIndex = (stepIdx: number): number => {
      if (stepIdx === 0) {
        return 0; // Can't go back from step 0
      }
      if (stepIdx === 1) {
        return 0; // From 1, go back to 0
      }
      if (stepIdx === TEST_AGENT_STEP) {
        return 1; // From 1.5, go back to 1
      }
      if (stepIdx === TEST_AGENT_WAIT_STEP) {
        return TEST_AGENT_STEP; // From 1.7, go back to 1.5
      }
      if (stepIdx === 2) {
        return TEST_AGENT_WAIT_STEP; // From 2, go back to 1.7
      }
      if (stepIdx === 3) {
        return 2; // From 3, go back to 2
      }
      if (stepIdx === 4) {
        return 3; // From 4, go back to 3
      }
      if (stepIdx === 5) {
        return 4; // From 5, go back to 4
      }
      return stepIdx - 1; // Fallback
    };

    // If we're on a sub-step > 0, go to previous sub-step of the same main step
    if (currentSubStepIndex > 0) {
      const prevSubStep = currentSubStepIndex - 1;
      console.log("Going to previous sub-step:", prevSubStep, "of step", currentStepIndex);
      setCurrentSubStepIndex(prevSubStep);
      
      // When going forward, a step is added to steps_completed when advancing to sub-step 1
      // So when going back from sub-step 1 to sub-step 0, we should remove it
      // This ensures consistency with forward navigation
      if (prevSubStep === 0 && stepsCompleted.includes(currentStepIndex)) {
        const updatedStepsCompleted = stepsCompleted.filter(
          (step) => step !== currentStepIndex
        );
        
        if (user?.id) {
          try {
            const updatedData = await tourAPI.updateTourStep(user.id, {
              current_step: currentStepIndex,
              steps_completed: updatedStepsCompleted,
            });
            console.log("Database updated: going back to sub-step 0, removed step", currentStepIndex, "from steps_completed");
            setStepsCompleted(updatedStepsCompleted);
            setTourData(updatedData);
          } catch (error) {
            console.error("Error updating tour step on sub-step back:", error);
          }
        }
      } else {
        // Just moving between sub-steps > 0, no database update needed
        console.log("Moving between sub-steps, no database update needed");
      }
      return;
    }

    // We're on sub-step 0, need to go to previous main step
    // Special handling for step 1.5 - go back to step 1, last sub-step (3)
    if (currentStepIndex === TEST_AGENT_STEP) {
      console.log("Going back from step 1.5 to step 1, last sub-step");
      const targetSubStep = getLastSubStepIndex(1);
      setCurrentStepIndex(1);
      setCurrentSubStepIndex(targetSubStep);
      
      // Remove step 1.5 from steps_completed (but keep step 1)
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== TEST_AGENT_STEP
      );

      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: 1,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated: step 1.5 -> step 1, sub-step", targetSubStep, "steps_completed:", updatedStepsCompleted);
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
      return;
    }

    // Special handling for step 2 - go back to step 1.7
    if (currentStepIndex === 2) {
      console.log("Going back from step 2 to step 1.7");
      setCurrentStepIndex(TEST_AGENT_WAIT_STEP);
      setCurrentSubStepIndex(0);
      
      // Remove step 2 from steps_completed
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== 2
      );

      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: TEST_AGENT_WAIT_STEP,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated: step 2 -> step 1.7, steps_completed:", updatedStepsCompleted);
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
      return;
    }

    // Special handling for step 1.7 - go back to step 1.5
    if (currentStepIndex === TEST_AGENT_WAIT_STEP) {
      console.log("Going back from step 1.7 to step 1.5");
      setCurrentStepIndex(TEST_AGENT_STEP);
      setCurrentSubStepIndex(0);
      
      // Remove step 1.7 from steps_completed
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== TEST_AGENT_WAIT_STEP
      );

      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: TEST_AGENT_STEP,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated: step 1.7 -> step 1.5, steps_completed:", updatedStepsCompleted);
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
      return;
    }

    // General case: going back from any other step
    if (currentStepIndex > 0) {
      const prevIndex = getPreviousMainStepIndex(currentStepIndex);
      
      // Find the last sub-step of the previous step
      const prevLastSubStep = getLastSubStepIndex(prevIndex);
      
      console.log("Going back from step", currentStepIndex, "to step", prevIndex, "sub-step", prevLastSubStep);
      
      setCurrentStepIndex(prevIndex);
      setCurrentSubStepIndex(prevLastSubStep);

      // Remove current step from steps_completed array
      // Also remove any steps that come after the previous step
      // Step order: 0, 1, 1.5, 1.7, 2, 3, 4, 5
      const updatedStepsCompleted = stepsCompleted.filter((step) => {
        // Keep steps that are before or equal to the previous step
        if (prevIndex === 0) {
          return step === 0;
        }
        if (prevIndex === 1) {
          return step === 0 || step === 1;
        }
        if (prevIndex === TEST_AGENT_STEP) {
          // If going to 1.5, keep steps 0, 1, and 1.5
          return step === 0 || step === 1 || step === TEST_AGENT_STEP;
        }
        if (prevIndex === TEST_AGENT_WAIT_STEP) {
          // If going to 1.7, keep steps 0, 1, 1.5, and 1.7
          return step === 0 || step === 1 || step === TEST_AGENT_STEP || step === TEST_AGENT_WAIT_STEP;
        }
        // For other steps (2, 3, 4, 5), keep steps <= prevIndex
        return step <= prevIndex;
      });

      // Update database
      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: prevIndex,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated on back button:", {
            current_step: prevIndex,
            sub_step: prevLastSubStep,
            steps_completed: updatedStepsCompleted,
          });
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
    }
  }, [currentStepIndex, currentSubStepIndex, TEST_AGENT_STEP, TEST_AGENT_WAIT_STEP, user?.id, stepsCompleted]);

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
  }, [tourActive, currentStepIndex]);

  // Callback for knowledge base completion - show Test Agent step (1.5)
  const onKnowledgeBaseCompleted = useCallback(() => {
    // If we're on step 1.5 (set when Next was clicked), show the tour now
    if (currentStepIndex === TEST_AGENT_STEP) {
      console.log("Knowledge base saved, showing step 1.5 (Test Agent)");
      // Re-activate the tour to show step 1.5
      setTourActive(true);
    } else if (tourActive && currentStepIndex === 1) {
      // Fallback: if somehow still on step 1, advance to 1.5
      console.log("Knowledge base completed, advancing to step 1.5 (Test Agent)");
      setCurrentStepIndex(TEST_AGENT_STEP);
      setCurrentSubStepIndex(0);
      
      // Update database with step 1.5
      if (user?.id) {
        const updatedStepsCompleted = [...new Set([...stepsCompleted, 1, TEST_AGENT_STEP])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: TEST_AGENT_STEP,
            steps_completed: updatedStepsCompleted,
          })
          .then((data) => {
            console.log("Database updated to step 1.5:", data);
            setTourData(data);
            setStepsCompleted(updatedStepsCompleted);
            setTourActive(true);
          })
          .catch((error) => {
            console.error("Error updating tour step to 1.5:", error);
          });
      }
    }
  }, [tourActive, currentStepIndex, user?.id, stepsCompleted]);

  // Callback for integrations navigation (Step 2 - just navigate, don't auto-advance)
  const onNavigateToIntegrations = useCallback(() => {
    console.log("onNavigateToIntegrations called", {
      tourActive,
      currentStepIndex,
    });
    // Just navigate to integrations, stay on step 2
    // Step will advance when user clicks Next button
  }, [tourActive, currentStepIndex]);

  // Callback for settings navigation (Step 3 - just navigate, don't advance)
  const onNavigateToSettings = useCallback(() => {
    console.log("onNavigateToSettings called", {
      tourActive,
      currentStepIndex,
    });
    // Just navigate to settings, stay on step 3
    // Step will complete when workspace hours are saved
  }, [tourActive, currentStepIndex]);

  // Callback for test agent message completion - mark that message was received
  const onTestAgentMessageCompleted = useCallback(() => {
    // Check if we're on step 1.7 (waiting for message)
    if (currentStepIndex === TEST_AGENT_WAIT_STEP) {
      console.log("Test agent message received on step 1.7 - marking as received, will advance to step 2");
      // Mark that we've received an agent message
      setTestAgentMessageReceived(true);
      
      // Automatically advance to step 2
      markStepCompleted(TEST_AGENT_WAIT_STEP);
      setCurrentStepIndex(2);
      setCurrentSubStepIndex(0);
      
      if (user?.id) {
        const updatedStepsCompleted = [...new Set([...stepsCompleted, 2])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: 2,
            steps_completed: updatedStepsCompleted,
          })
          .then((data) => {
            console.log("Database updated: advanced to step 2 after message received, steps_completed:", updatedStepsCompleted);
            setTourData(data);
            setStepsCompleted(updatedStepsCompleted);
            // Re-activate tour for step 2
            setTourActive(true);
          })
          .catch((error) => {
            console.error("Error updating tour step:", error);
            // Still re-activate tour even if database update fails
            setTourActive(true);
          });
      } else {
        // Re-activate tour even without user ID
        setTourActive(true);
      }
    } else if (currentStepIndex === TEST_AGENT_STEP) {
      // If still on step 1.5, just mark message as received (will be handled when advancing to 1.7)
      console.log("Test agent message received on step 1.5 - marking as received");
      setTestAgentMessageReceived(true);
    }
  }, [currentStepIndex, user?.id, stepsCompleted, markStepCompleted]);

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
    onTestAgentMessageCompleted,
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
