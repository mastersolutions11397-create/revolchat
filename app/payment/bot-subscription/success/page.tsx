import Link from "next/link";
import { CheckCircle2, MessageSquare } from "lucide-react";

export default function BotSubscriptionSuccessPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-bg mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          You&apos;re subscribed!
        </h1>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          Your payment was successful. Return to the chat — your AI assistant
          is ready and waiting.
        </p>

        <div className="bg-surface border border-border rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
            <span className="font-semibold text-text-primary text-sm">What&apos;s next?</span>
          </div>
          <ul className="text-sm text-text-muted space-y-1 ml-8">
            <li>Go back to Telegram or Instagram</li>
            <li>Send any message to the bot</li>
            <li>Your full access is already active</li>
          </ul>
        </div>

        <p className="text-xs text-text-muted">
          Questions?{" "}
          <Link
            href="mailto:support@yetti.ai"
            className="text-brand hover:text-brand-light transition-colors"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
