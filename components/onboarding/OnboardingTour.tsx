"use client";

import React, { useEffect, useState, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import { usePathname } from "next/navigation";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { getCurrentStep } from "@/lib/tour/steps";
import { CustomTooltip } from "./CustomTooltip";
import { TourProgressBar } from "./TourProgressBar";

export function OnboardingTour() {
  const pathname = usePathname();
  const {
    tourActive,
    currentStepIndex,
    tourStatus,
    loading,
    skipTour,
    nextStep,
    prevStep,
  } = useOnboardingTour();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Get the appropriate step based on current route and step index
  const currentStep = getCurrentStep(currentStepIndex, pathname);

  // Update Joyride when tour becomes active
  useEffect(() => {
    if (tourActive && !loading && currentStep) {
      setRun(true);
      setStepIndex(0);
    } else {
      setRun(false);
    }
  }, [tourActive, loading, currentStep]);

  // Handle Joyride callback events
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type } = data;

      // Handle tour completion or skipping
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        if (action === ACTIONS.SKIP) {
          skipTour();
        }
      }

      // Handle step navigation
      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.NEXT) {
          // Move to next step in context (not just next Joyride step)
          nextStep();
        } else if (action === ACTIONS.PREV) {
          prevStep();
        }
      }

      // Handle close button
      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.warn("Tour target not found:", currentStep?.target);
        // Could auto-advance or wait
      }
    },
    [skipTour, nextStep, prevStep, currentStep]
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
    },
  ];

  return (
    <>
      {/* Progress Bar */}
      <TourProgressBar currentStep={currentStepIndex} onSkip={skipTour} />

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
