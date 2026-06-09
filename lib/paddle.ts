import { Environment, Paddle } from "@paddle/paddle-node-sdk";

export const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environment) ?? Environment.production,
});

export type PlanConfig = {
  name:    string;
  priceId: string;
  price:   number;
};

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name:    "Starter",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER!,
    price:   29,
  },
} as const;
