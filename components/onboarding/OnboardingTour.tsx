"use client";

import React, { useEffect, useState, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import { usePathname } from "next/navigation";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { getCurrentStep } from "@/lib/tour/steps";
import { CustomTooltip } from "./CustomTooltip";

export function OnboardingTour() {
  const pathname = usePathname();
  const {
    tourActive,
    currentStepIndex,
    currentSubStepIndex,
    tourStatus,
    loading,
    skipTour,
    nextStep,
    prevStep,
  } = useOnboardingTour();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Get the appropriate step based on current route, step index, and sub-step index
  const currentStep = getCurrentStep(currentStepIndex, pathname, currentSubStepIndex);

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
      console.log("Restarting Joyride with step:", currentStep);
      // Restart Joyride to pick up new step
      setRun(false);
      setStepIndex(0);

      // Small delay to ensure Joyride properly restarts
      const timer = setTimeout(() => {
        setRun(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setRun(false);
      if (!tourActive) console.log("Tour not active");
      if (loading) console.log("Tour still loading");
      if (!currentStep)
        console.log("No current step found for route:", pathname);
    }
  }, [tourActive, loading, currentStep, currentStepIndex, pathname]);

  // Handle Joyride callback events
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type, lifecycle } = data;

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
            totalSteps: 5,
          }
        );
        setRun(false);
        if (action === ACTIONS.SKIP) {
          skipTour();
        } else if (status === STATUS.FINISHED) {
          if (currentStepIndex < 4) {
            // Joyride thinks it's finished but we have more steps - advance!
            console.log(
              "Joyride finished but more steps remain - advancing tour"
            );
            nextStep();
          } else {
            // We're on the last step (step 4) - complete the tour
            console.log("Joyride finished on last step - completing tour");
            nextStep(); // This will trigger completeTour() since we're at the last step
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
          console.log(
            "Calling nextStep() to advance tour from step",
            currentStepIndex,
            "to",
            currentStepIndex + 1
          );
          nextStep();
        } else if (action === ACTIONS.PREV) {
          console.log("Calling prevStep() to go back");
          prevStep();
        } else if (action === ACTIONS.CLOSE) {
          console.log("Close action detected - advancing tour");
          nextStep();
        }
      }

      // Handle close button
      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.warn("Tour target not found:", currentStep?.target);
        // Could auto-advance or wait
      }
    },
    [skipTour, nextStep, prevStep, currentStep, currentStepIndex, pathname]
  );

  // Don't render if tour is not active or still loading
  if (!tourActive || loading || !currentStep) {
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
        isActualLastStep: currentStepIndex === 3, // Step 3 is the last step (0-indexed)
        currentStepIndex,
        totalSteps: 4,
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
