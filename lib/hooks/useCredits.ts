"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const GLOBAL_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

interface CreditsData {
  credits: number;
  loading: boolean;
  error: string | null;
}

export function useCredits(): CreditsData {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const creditsUrl = `${process.env.NEXT_PUBLIC_API_URL}/v2/api/credits?user_id=${user.id}&workspace_id=${GLOBAL_WORKSPACE_ID}`;
        const creditsResponse = await fetch(creditsUrl);

        if (!creditsResponse.ok) {
          const errorData = await creditsResponse.json();
          throw new Error(errorData.error || "Failed to fetch credits");
        }

        const creditsData = await creditsResponse.json();
        setCredits(creditsData.credits || 0);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch credits"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
  }, [user?.id]);

  return {
    credits,
    loading,
    error,
  };
}

