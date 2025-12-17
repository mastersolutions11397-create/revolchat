import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { OnboardingTourProvider } from "@/lib/contexts/OnboardingTourContext";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingTourProvider>
        <OnboardingTour />
        <DashboardShell>{children}</DashboardShell>
      </OnboardingTourProvider>
    </ProtectedRoute>
  );
}
