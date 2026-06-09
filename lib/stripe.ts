import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

import type { Stripe as StripeJS } from "@stripe/stripe-js";
let stripePromise: Promise<StripeJS | null> | null = null;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export type PlanConfig = {
  name:    string;
  priceId: string;
  price:   number;
};

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name:    "Starter",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
    price:   29,
  },
} as const;
