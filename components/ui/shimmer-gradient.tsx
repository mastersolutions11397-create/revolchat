"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShimmerGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  durationMs?: number;
  height?: number | string; // explicit height for predictable sizing
}

export function ShimmerGradient({
  className,
  radius = "2xl",
  durationMs = 1600,
  height = "11rem", // ~h-44 default
  ...props
}: ShimmerGradientProps) {
  const keyframes = `
    @keyframes ws-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;

  const radiusClass =
    radius === "none"
      ? "rounded-none"
      : radius === "sm"
      ? "rounded-sm"
      : radius === "md"
      ? "rounded-md"
      : radius === "lg"
      ? "rounded-lg"
      : radius === "xl"
      ? "rounded-xl"
      : "rounded-2xl";

  const resolvedHeight =
    typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-white/5",
        radiusClass,
        className
      )}
      style={{ height: resolvedHeight, ...(props.style || {}) }}
      {...props}
    >
      <style>{keyframes}</style>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full",
          "bg-linear-to-r from-transparent via-white/15 to-transparent"
        )}
        style={{
          animation: `ws-shimmer ${durationMs}ms infinite linear`,
        }}
      />
      {/* Base gradient tint for nicer appearance on dark bg */}
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent" />
    </div>
  );
}


