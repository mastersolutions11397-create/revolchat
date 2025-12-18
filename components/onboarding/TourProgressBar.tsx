"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOTAL_TOUR_STEPS, STEP_NAMES } from "@/lib/tour/steps";

interface TourProgressBarProps {
  currentStep: number;
  onSkip: () => void;
}

export function TourProgressBar({ currentStep, onSkip }: TourProgressBarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const progress = ((currentStep + 1) / TOTAL_TOUR_STEPS) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 md:top-20 left-0 right-0 z-[9999] bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 shadow-xl"
      >
        {isMinimized ? (
          // Minimized view
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500/20 ring-2 ring-sky-500/50">
                  <span className="text-xs font-bold text-sky-400">
                    {currentStep + 1}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
                  Tour: {STEP_NAMES[currentStep]}
                </span>
              </div>

              <div className="hidden sm:block w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-sky-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Expand"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Expanded view
          <div className="px-6 py-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/20 ring-2 ring-sky-500/50">
                    <span className="text-sm font-bold text-sky-400">
                      {currentStep + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Getting Started Tour
                  </h3>
                </div>
                <p className="text-sm text-slate-300">
                  Step {currentStep + 1} of {TOTAL_TOUR_STEPS}:{" "}
                  {STEP_NAMES[currentStep]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Minimize"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={onSkip}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
                >
                  <X className="h-4 w-4" />
                  Skip Tour
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                <span>{Math.round(progress)}% Complete</span>
                <span>
                  {TOTAL_TOUR_STEPS - currentStep - 1} steps remaining
                </span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>

              {/* Step indicators */}
              <div className="flex justify-between mt-3">
                {STEP_NAMES.map((name, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        index <= currentStep
                          ? "bg-sky-500 shadow-lg shadow-sky-500/50"
                          : "bg-white/20"
                      }`}
                    />
                    <span
                      className={`text-xs text-center transition-colors hidden sm:block ${
                        index <= currentStep
                          ? "text-sky-400 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
      </motion.div>
    </AnimatePresence>
  );
}
