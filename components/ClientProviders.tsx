"use client";

import { AuthProvider } from "@/lib/auth-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <LanguageProvider>
          {children}
          <LanguageSelector />
        </LanguageProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

