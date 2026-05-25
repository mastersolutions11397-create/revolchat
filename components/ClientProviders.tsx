"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEmbedRoute = pathname?.startsWith("/embed/");

  if (isEmbedRoute) {
    return <>{children}</>;
  }

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

