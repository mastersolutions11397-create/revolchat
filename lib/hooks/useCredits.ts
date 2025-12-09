"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

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

        // Fetch the most recent transaction to get current balance
        const { data: latestTransaction, error: balanceError } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (balanceError && balanceError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine for new users
          throw new Error(balanceError.message);
        }

        // If no transactions exist, balance is 0
        setCredits(latestTransaction?.balance ?? 0);
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

