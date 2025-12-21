"use client";

import React from "react";
import { TooltipRenderProps } from "react-joyride";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface CustomTooltipProps extends TooltipRenderProps {
  stepName?: string;
}

export function CustomTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
  isLastStep,
}: CustomTooltipProps) {
  // Get custom data from step to determine if this is the actual last step
  const stepData = step.data as
    | {
        isActualLastStep?: boolean;
        currentStepIndex?: number;
        totalSteps?: number;
      }
    | undefined;
  const isActualLastStep = stepData?.isActualLastStep ?? isLastStep;
  const actualStepIndex = stepData?.currentStepIndex ?? index;
  const totalSteps = stepData?.totalSteps ?? size;
  return (
    <div
      {...tooltipProps}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6 text-white border-2 border-white ring-1 ring-white/10 max-w-md animate-in fade-in zoom-in-95 duration-200"
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(14, 165, 233, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-24 w-24 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 ring-2 ring-sky-500/50">
                <span className="text-sm font-bold text-sky-400">
                  {actualStepIndex + 1}
                </span>
              </div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Step {actualStepIndex + 1} of {totalSteps}
              </span>
            </div>
          </div>

          <button
            {...closeProps}
            className="ml-4 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div
            className="text-base leading-relaxed text-slate-100"
            dangerouslySetInnerHTML={{ __html: step.content as string }}
          />
        </div>

        {/* Footer with buttons */}
        <div className="flex items-center justify-between gap-3">
          {/* Skip button */}
          <button
            {...skipProps}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {/* Back button */}
            {actualStepIndex > 0 && (
              <button
                {...backProps}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {/* Next/Close button */}
            {continuous ? (
              <button
                {...primaryProps}
                onClick={(e) => {
                  console.log("Tooltip button clicked:", {
                    isActualLastStep,
                    isLastStep,
                    continuous,
                    actualStepIndex,
                    index,
                    totalSteps,
                    size,
                  });
                  primaryProps.onClick(e);
                }}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:shadow-sky-500/50 hover:from-sky-600 hover:to-sky-700"
              >
                {isActualLastStep ? "Finish" : "Next"}
                {!isActualLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                {...closeProps}
                onClick={(e) => {
                  console.log("Got it button clicked");
                  closeProps.onClick(e);
                }}
                className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:shadow-sky-500/50"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
    </div>
  );
}
