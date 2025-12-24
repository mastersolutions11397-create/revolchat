"use client";

import React, { useEffect, useState, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import { usePathname } from "next/navigation";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { getCurrentStep, isTestAgentStep, TOTAL_TOUR_STEPS } from "@/lib/tour/steps";
import { CustomTooltip } from "./CustomTooltip";

export function OnboardingTour() {
  const pathname = usePathname();
  const {
    tourActive,
    currentStepIndex,
    currentSubStepIndex,
    loading,
    skipTour,
    nextStep,
    prevStep,
    completeTour,
  } = useOnboardingTour();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetReady, setTargetReady] = useState(false);

  // Get the appropriate step based on current route, step index, and sub-step index
  const currentStep = getCurrentStep(currentStepIndex, pathname, currentSubStepIndex);

  // Check if target element exists in DOM
  const checkTargetExists = (target: string | undefined): boolean => {
    if (!target) return false;
    
    // If target is "body", it always exists
    if (target === "body") return true;
    
    try {
      const element = document.querySelector(target);
      return element !== null;
    } catch (error) {
      console.error("Error checking target element:", error);
      return false;
    }
  };

  // Check if knowledge tabs/modal are open
  const areKnowledgeTabsOpen = (): boolean => {
    // Check for the knowledge form modal by looking for the modal overlay
    // The modal appears when activeTab is set (text, pdf, or sheets)
    // The modal has a fixed inset-0 overlay with z-[100]
    const modalOverlay = document.querySelector('.fixed.inset-0.z-\\[100\\]');
    
    // Also check for the modal content that contains "Add Text", "Add PDF", or template cards
    const modalContent = Array.from(document.querySelectorAll('div')).find(
      (el) => {
        const text = el.textContent || '';
        return (
          text.includes('Add Text') ||
          text.includes('Add PDF') ||
          text.includes('Conversational Template') ||
          text.includes('Order Fulfillment Template')
        ) && el.classList.contains('rounded-2xl');
      }
    );
    
    // If modal overlay exists and is visible, tabs are open
    return !!(modalOverlay && (modalOverlay as HTMLElement).offsetParent !== null && modalContent);
  };

  // Update Joyride when tour becomes active or step changes
  useEffect(() => {
    console.log("OnboardingTour state:", {
      tourActive,
      loading,
      currentStep: currentStep?.target,
      currentStepIndex,
      pathname,
    });

    if (tourActive && !loading && currentStep) {
      // Don't show test agent step (1.5) if knowledge tabs are open
      if (isTestAgentStep(currentStepIndex) && areKnowledgeTabsOpen()) {
        console.log("Test agent step (1.5) blocked: knowledge tabs are open");
        setRun(false);
        setTargetReady(false);
        return;
      }

      console.log("Restarting Joyride with step:", currentStep);
      // Reset state
      setRun(false);
      setStepIndex(0);
      setTargetReady(false);

      // Check if target exists and wait for it if needed
      const targetExists = checkTargetExists(
        typeof currentStep.target === 'string' ? currentStep.target : undefined
      );
      
      if (targetExists) {
        // Target exists, start immediately with small delay
        const timer = setTimeout(() => {
          setTargetReady(true);
          setRun(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Target doesn't exist yet, poll for it
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total (50 * 100ms)
        
        const checkInterval = setInterval(() => {
          attempts++;
          const exists = checkTargetExists(
            typeof currentStep.target === 'string' ? currentStep.target : undefined
          );
          
          if (exists) {
            clearInterval(checkInterval);
            setTargetReady(true);
            // Small delay to ensure DOM is stable
            setTimeout(() => {
              setRun(true);
            }, 100);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.warn("Target element not found after waiting:", currentStep.target);
            // Don't start the tour if target never appears
            setTargetReady(false);
            setRun(false);
          }
        }, 100);

        return () => clearInterval(checkInterval);
      }
    } else {
      setRun(false);
      setTargetReady(false);
      if (!tourActive) console.log("Tour not active");
      if (loading) console.log("Tour still loading");
      if (!currentStep)
        console.log("No current step found for route:", pathname);
    }
  }, [tourActive, loading, currentStep, currentStepIndex, pathname]);

  // Monitor for knowledge tabs closing when on test agent step
  useEffect(() => {
    if (!tourActive || !isTestAgentStep(currentStepIndex)) return;

    // Poll to check if knowledge tabs close
    const checkInterval = setInterval(() => {
      if (!areKnowledgeTabsOpen() && currentStep) {
        // Tabs closed, allow tour to show
        const targetExists = checkTargetExists(
          typeof currentStep.target === 'string' ? currentStep.target : undefined
        );
        if (targetExists && !run) {
          console.log("Knowledge tabs closed, showing test agent step");
          setTargetReady(true);
          setRun(true);
        }
      } else if (areKnowledgeTabsOpen() && run) {
        // Tabs opened, hide tour
        console.log("Knowledge tabs opened, hiding test agent step");
        setRun(false);
        setTargetReady(false);
      }
    }, 200); // Check every 200ms

    return () => clearInterval(checkInterval);
  }, [tourActive, currentStepIndex, currentSubStepIndex, currentStep, run]);

  // Handle Joyride callback events
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, type, lifecycle } = data;

      console.log("Joyride callback:", {
        status,
        action,
        type,
        lifecycle,
        currentStepIndex,
        currentStep: currentStep?.target,
        pathname,
      });

      // Handle tour completion or skipping
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        console.log(
          "Tour finished or skipped - checking if we should advance",
          {
            status,
            action,
            currentStepIndex,
            totalSteps: 6,
          }
        );
        setRun(false);
        if (action === ACTIONS.SKIP) {
          skipTour();
        } else if (status === STATUS.FINISHED) {
          // Check if we're on the last step (step 5, which is index 5 in 0-indexed)
          // TOTAL_TOUR_STEPS is 7 (0, 1, 1.5, 2, 3, 4, 5), so last step index is 5
          const lastStepIndex = TOTAL_TOUR_STEPS - 1; // 6, but we use 5 as last step
          if (currentStepIndex < 5) {
            // Joyride thinks it's finished but we have more steps - advance!
            console.log(
              "Joyride finished but more steps remain - advancing tour"
            );
            nextStep();
          } else {
            // We're on the last step (step 5) - complete the tour immediately
            console.log("Finish button clicked on last step - completing tour");
            // Mark step as completed and finish the tour
            // nextStep will handle marking the step and updating status to completed
            nextStep().catch((error: unknown) => {
              console.error("Error completing tour:", error);
              // If nextStep fails, still try to complete the tour
              completeTour();
            });
          }
        }
      }

      // Handle step navigation
      if (type === EVENTS.STEP_AFTER) {
        console.log(
          "STEP_AFTER event - action:",
          action,
          "lifecycle:",
          lifecycle
        );
        if (action === ACTIONS.NEXT) {
          // Move to next step in context (not just next Joyride step)
          // nextStep now performs actions (navigation, clicks) and updates database
          console.log(
            "Calling nextStep() to advance tour from step",
            currentStepIndex,
            "sub-step",
            currentSubStepIndex
          );
          nextStep().catch((error) => {
            console.error("Error advancing tour step:", error);
          });
        } else if (action === ACTIONS.PREV) {
          console.log("Calling prevStep() to go back");
          prevStep();
        } else if (action === ACTIONS.CLOSE) {
          console.log("Close action detected - ignoring (close button removed)");
          // Close button removed, do nothing
        }
      }

      // Handle target not found
      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.warn("Tour target not found:", currentStep?.target);
        // Stop the tour and advance to next step
        setRun(false);
        // Auto-advance if target is missing
        if (currentStepIndex < 5) {
          console.log("Target not found, advancing to next step");
          setTimeout(() => {
            nextStep().catch((error) => {
              console.error("Error advancing tour step after target not found:", error);
            });
          }, 500);
        } else {
          // If on last step and target not found, complete the tour
          completeTour();
        }
      }
    },
    [skipTour, nextStep, prevStep, completeTour, currentStep, currentStepIndex, pathname]
  );

  // Don't render if tour is not active or still loading
  if (!tourActive || loading || !currentStep) {
    return null;
  }

  // Don't render Joyride if target is not ready (doesn't exist in DOM)
  if (!targetReady || !run) {
    return null;
  }

  // Double-check target exists before rendering
  const targetExists = checkTargetExists(
    typeof currentStep.target === 'string' ? currentStep.target : undefined
  );
  if (!targetExists) {
    console.warn("Target element not found, skipping Joyride render:", currentStep.target);
    return null;
  }

  // Create a single-step array for Joyride (we manage multi-step logic ourselves)
  const steps = [
    {
      ...currentStep,
      // Override some properties for consistency
      disableOverlayClose: true,
      spotlightClicks: true,
      // Pass custom data about the actual tour progress
      data: {
        isActualLastStep: currentStepIndex === 5, // Step 5 is the last step (0-indexed)
        currentStepIndex,
        totalSteps: 6,
      },
    },
  ];

  return (
    <>
      {/* Joyride Component */}
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress={false} // We show our custom progress bar
        showSkipButton={true}
        disableOverlayClose={true}
        disableCloseOnEsc={false}
        spotlightClicks={true}
        hideBackButton={currentStepIndex === 0}
        callback={handleJoyrideCallback}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            primaryColor: "#0ea5e9", // sky-500
            zIndex: 10000,
            arrowColor: "transparent",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0)",
            mixBlendMode: "normal",
          },
          spotlight: {
            backgroundColor: "transparent",
            border: "2px solid #0ea5e9",
            borderRadius: "12px",
          },
        }}
        floaterProps={{
          disableAnimation: false,
          styles: {
            arrow: {
              length: 0,
              spread: 0,
            },
          },
        }}
      />
    </>
  );
}
