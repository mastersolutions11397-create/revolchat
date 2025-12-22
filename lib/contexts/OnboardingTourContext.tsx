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
  const hasStartedTourForNoWorkspace = useRef(false);

  // Log when currentStepIndex changes
  useEffect(() => {
    console.log("Tour step changed to:", currentStepIndex);
  }, [currentStepIndex]);

  // Total number of steps in the tour
  // Note: Step 1.5 (test agent) is included, so we have 0, 1, 1.5, 2, 3, 4, 5 = 7 steps total
  const TOTAL_STEPS = 7;
  const TEST_AGENT_STEP = 1.5;

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

  // Reset the flag when workspace status changes
  useEffect(() => {
    if (hasWorkspaces || currentWorkspace) {
      hasStartedTourForNoWorkspace.current = false;
    }
  }, [hasWorkspaces, currentWorkspace]);

  // Auto-start tour if no workspace found and tour status is in_progress/not_started with step 0
  useEffect(() => {
    if (!user?.id || loading || !isInitialized.current) return;
    if (hasWorkspaces || currentWorkspace) return; // Skip if workspace exists
    if (!tourData) return;
    if (hasStartedTourForNoWorkspace.current) return; // Prevent multiple triggers

    // Check if tour status is in_progress or not_started and step is 0
    if (
      (tourStatus === "in_progress" || tourStatus === "not_started") &&
      currentStepIndex === 0
    ) {
      console.log(
        "No workspace found, tour status:",
        tourStatus,
        "step:",
        currentStepIndex,
        "- starting tour immediately"
      );

      hasStartedTourForNoWorkspace.current = true;

      // If tour is not_started, start it first
      if (tourStatus === "not_started") {
        const startTourForNewUser = async () => {
          try {
            const data = await tourAPI.startTour(user.id);
            console.log("Tour started for user without workspace:", data);
            setTourData(data);
            setTourStatus("in_progress");
            setTourActive(true);
            setCurrentStepIndex(0);
            setCurrentSubStepIndex(0); // Ensure sub-step is also 0
            console.log("Tour activated: tourActive=true, currentStepIndex=0, currentSubStepIndex=0");
          } catch (error) {
            console.error("Error starting tour for user without workspace:", error);
            hasStartedTourForNoWorkspace.current = false; // Reset on error to allow retry
          }
        };

        startTourForNewUser();
      } else {
        // Tour is already in_progress, just activate it
        console.log("Activating existing in_progress tour for user without workspace");
        setTourActive(true);
        setCurrentStepIndex(0);
        setCurrentSubStepIndex(0); // Ensure sub-step is also 0
      }
    }
  }, [
    user?.id,
    hasWorkspaces,
    currentWorkspace,
    tourStatus,
    currentStepIndex,
    loading,
    tourData,
  ]);

  // Check if workspace exists and update tour accordingly
  useEffect(() => {
    if (!user?.id || !hasWorkspaces || !currentWorkspace) return;
    if (!tourData) return;
    
    // If workspace exists and tour is not_started, check if workspace is onboarded before updating
    if (tourStatus === "not_started" && !hasUpdatedTourForWorkspace.current) {
      hasUpdatedTourForWorkspace.current = true;
      const updateTourForExistingWorkspace = async () => {
        try {
          // Check if workspace is onboarded
          const onboardingStatus = await yettiOnboardingAPI
            .getOnboardingStatus(currentWorkspace.id)
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
              .getOnboardingStatus(currentWorkspace.id)
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
  }, [user?.id, hasWorkspaces, currentWorkspace, currentWorkspace?.id, tourStatus, tourData]);

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

    // Special handling for step 1.5 (Test Agent) - advance to step 2
    if (currentStepIndex === TEST_AGENT_STEP) {
      console.log("Step 1.5: Advancing to step 2 (Integrations)");
      markStepCompleted(TEST_AGENT_STEP);
      setCurrentStepIndex(2);
      setCurrentSubStepIndex(0);
      
      if (user?.id) {
        const updatedStepsCompleted = [...new Set([...stepsCompleted, TEST_AGENT_STEP])];
        tourAPI
          .updateTourStep(user.id, {
            current_step: 2,
            steps_completed: updatedStepsCompleted,
          })
          .then(() => {
            console.log("Database updated to step 2");
            setStepsCompleted(updatedStepsCompleted);
          })
          .catch((error) => {
            console.error("Error updating tour step to 2:", error);
          });
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
    } else if (currentStepIndex > TEST_AGENT_STEP && currentStepIndex < 5) {
      // Advance to next main step (for steps after 1.5, but before last step)
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
  }, [currentStepIndex, currentSubStepIndex, TOTAL_STEPS, TEST_AGENT_STEP, user?.id, completeTour, stepsCompleted, markStepCompleted]);

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

    // Special handling for step 1.5 - go back to step 1, sub-step 3
    if (currentStepIndex === TEST_AGENT_STEP) {
      console.log("Going back from step 1.5 to step 1, sub-step 3");
      setCurrentStepIndex(1);
      setCurrentSubStepIndex(3);
      
      // Remove step 1.5 from steps_completed
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== TEST_AGENT_STEP
      );

      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: 1,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated on back button from step 1.5");
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
      return;
    }

    // Special handling for step 2 - go back to step 1.5
    if (currentStepIndex === 2) {
      console.log("Going back from step 2 to step 1.5");
      setCurrentStepIndex(TEST_AGENT_STEP);
      setCurrentSubStepIndex(0);
      
      // Remove step 2 from steps_completed
      const updatedStepsCompleted = stepsCompleted.filter(
        (step) => step !== 2
      );

      if (user?.id) {
        try {
          const updatedData = await tourAPI.updateTourStep(user.id, {
            current_step: TEST_AGENT_STEP,
            steps_completed: updatedStepsCompleted,
          });
          console.log("Database updated on back button from step 2");
          setStepsCompleted(updatedStepsCompleted);
          setTourData(updatedData);
        } catch (error) {
          console.error("Error updating tour step on back button:", error);
        }
      }
      return;
    }

    // If we're on sub-step 0, go to previous main step
    if (currentStepIndex > 0 && currentStepIndex !== TEST_AGENT_STEP) {
      const prevIndex = currentStepIndex === 2 ? TEST_AGENT_STEP : currentStepIndex - 1;
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
  }, [currentStepIndex, currentSubStepIndex, TEST_AGENT_STEP, user?.id, stepsCompleted]);

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

  // Callback for test agent message completion - advance to step 2 (Integrations)
  const onTestAgentMessageCompleted = useCallback(() => {
    if (tourActive && currentStepIndex === TEST_AGENT_STEP) {
      // Mark step 1.5 as completed and advance to step 2 (Integrations)
      console.log("Test agent message completed, advancing to step 2 (Integrations)");
      markStepCompleted(TEST_AGENT_STEP);
      setCurrentStepIndex(2);
      setCurrentSubStepIndex(0);
      
      // Update database with step 2
      if (user?.id) {
        tourAPI
          .updateTourStep(user.id, {
            current_step: 2,
            steps_completed: [...new Set([...stepsCompleted, TEST_AGENT_STEP])],
          })
          .then((data) => {
            console.log("Database updated to step 2:", data);
            setTourData(data);
            setStepsCompleted([...new Set([...stepsCompleted, TEST_AGENT_STEP])]);
          })
          .catch((error) => {
            console.error("Error updating tour step to 2:", error);
          });
      }
    }
  }, [tourActive, currentStepIndex, markStepCompleted, user?.id, stepsCompleted]);

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
