import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
