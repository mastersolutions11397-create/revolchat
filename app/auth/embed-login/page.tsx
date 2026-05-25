"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EmbedLoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startGoogleLogin() {
      const params = new URLSearchParams(window.location.search);
      const botId = params.get("botId");

      if (!botId) {
        setError("Missing bot ID.");
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=/embed/${encodeURIComponent(
        botId
      )}&embed_oauth=1`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    }

    startGoogleLogin();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <div>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-primary" />
        <p className="mt-4 text-sm text-slate-600">
          {error ?? "Opening Google sign in..."}
        </p>
      </div>
    </main>
  );
}
