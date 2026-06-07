import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

// Stripe client for server-side operations
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

// Stripe client for client-side operations
import type { Stripe as StripeJS } from "@stripe/stripe-js";
let stripePromise: Promise<StripeJS | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Price IDs — one per subscription plan
export const STRIPE_PRICES = {
  ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!,
  PRO:        process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  GROWTH:     process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH!,
  STARTER:    process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
} as const;

export type PlanConfig = {
  name:    string;
  priceId: string;
  price:   number;
};

// Monthly subscription plans — unlimited usage per plan
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name:    "Starter",
    priceId: STRIPE_PRICES.STARTER,
    price:   29,
  },
  growth: {
    name:    "Growth",
    priceId: STRIPE_PRICES.GROWTH,
    price:   59,
  },
  pro: {
    name:    "Pro",
    priceId: STRIPE_PRICES.PRO,
    price:   99,
  },
  enterprise: {
    name:    "Enterprise",
    priceId: STRIPE_PRICES.ENTERPRISE,
    price:   179,
  },
} as const;
