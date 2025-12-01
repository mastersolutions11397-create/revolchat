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

// Price IDs
export const STRIPE_PRICES = {
  YETTI_CREDITS: process.env.NEXT_PUBLIC_STRIPE_PRICE_YETTI_CREDITS!,
  ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!,
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  GROWTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH!,
  STARTER: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
} as const;

// Plan configuration type
export type PlanConfig = {
  name: string;
  priceId: string;
  credits: number;
  price: number;
};

// Plan configurations
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name: "Starter",
    priceId: STRIPE_PRICES.STARTER,
    credits: 1000,
    price: 29,
  },
  growth: {
    name: "Growth",
    priceId: STRIPE_PRICES.GROWTH,
    credits: 2500,
    price: 59,
  },
  pro: {
    name: "Pro",
    priceId: STRIPE_PRICES.PRO,
    credits: 5000,
    price: 99,
  },
  enterprise: {
    name: "Enterprise",
    priceId: STRIPE_PRICES.ENTERPRISE,
    credits: 10000,
    price: 179,
  },
  yetti_credits: {
    name: "Yetti Credits",
    priceId: STRIPE_PRICES.YETTI_CREDITS,
    credits: 500, // This would be a one-time purchase for additional credits
    price: 10, // $10 for 500 credits
  },
} as const;
