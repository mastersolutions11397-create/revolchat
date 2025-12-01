"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Share2, ChevronsRight, CheckCircle, User, ShieldCheck, Zap, Headphones, DollarSign, LineChart } from "lucide-react";

export default function EarnPage() {
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("pro");
  const [referrals, setReferrals] = useState<number>(10);

  const planPrice = plan === "starter" ? 49 : plan === "pro" ? 159 : 279;
  const commissionRate = 0.25;
  const monthly = Math.round(planPrice * commissionRate * referrals * 10) / 10;
  const yearly = Math.round(monthly * 12);
  const perReferral = Math.round(planPrice * commissionRate);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav (reuse landing style) */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200/60 bg-white backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                Yetti<span className="text-gray-400">.ai</span>
              </span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/#integrations" className="text-gray-600 hover:text-gray-900">
                Integrations
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="">
        {/* Hero */}
        <section className="relative pt-24 min-h-screen overflow-hidden bg-[#0b1220]">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.08),transparent_70%)]" />
            <div className="absolute -top-24 -right-24 h-[520px] w-[520px] rounded-full bg-linear-to-br from-white/10 to-transparent blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-linear-to-br from-sky-300/10 via-blue-200/10 to-transparent blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="text-white">
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  25% Commission
                </span>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Earn with Yetti Affiliates
                </h1>
                <p className="mt-4 text-lg text-white/80">
                  Share Yetti and earn 25% commission on every order with real-time tracking and weekly payouts.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
                  >
                    Join Affiliate Program
                  </Link>
                  <a
                    href="https://agent-dispatch.com/earn"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Learn More
                  </a>
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                      25%
                    </span>
                    Commission
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-sky-500">
                      ✓
                    </span>
                    Real-time Tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                      $
                    </span>
                    Weekly Payouts
                  </div>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-6 rounded-3xl bg-linear-to-br from-white/10 to-white/0 blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-white/5">
                    <Image
                      src="/yetti/yetting_holding_dollar_sign.png"
                      alt="Yetti holding dollar sign"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 28rem"
                    />
                  </div>
                  <p className="mt-4 text-center text-sm text-white/80">
                    Your friendly Yetti helps you earn while you sleep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Yetti? (light mode) - moved below steps */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Why <span className="text-sky-500">Yetti</span>?
            </h2>
            <p className="mt-3 text-center text-gray-600">
              Join the affiliate program trusted by thousands of successful partners
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-center text-xl font-semibold text-gray-900">
                  Lightning Fast Setup
                </h3>
                <p className="mt-3 text-center text-gray-600">
                  Get started in minutes with our streamlined onboarding process.
                  No complex configurations needed.
                </p>
                <div className="mx-auto mt-6 w-fit rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500" />
                  5 min setup
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-center text-xl font-semibold text-gray-900">
                  Trusted & Secure
                </h3>
                <p className="mt-3 text-center text-gray-600">
                  Join thousands of satisfied affiliates who trust our platform.
                  Bank-level security for all transactions.
                </p>
                <div className="mx-auto mt-6 w-fit rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500" />
                  10k+ affiliates
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Headphones className="h-7 w-7" />
                </div>
                <h3 className="text-center text-xl font-semibold text-gray-900">
                  Dedicated Support
                </h3>
                <p className="mt-3 text-center text-gray-600">
                  24/7 expert support team ready to help you maximize your earnings
                  and grow your affiliate business.
                </p>
                <div className="mx-auto mt-6 w-fit rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500" />
                  24/7 support
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 w-full max-w-md">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-3 text-center text-gray-700">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500" />
                Trusted by 10,000+ affiliates
              </div>
            </div>
          </div>
        </section>

        

       
        {/* How our affiliate program works (Yetti theme) */}
        <section className="min-h-screen bg-[#0b1220]">
          <div className="mx-auto flex min-h-screen items-center max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="w-full">
              <h2 className="text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                How our <span className="text-sky-500">affiliate program</span> works
              </h2>
              <p className="mt-3 text-center text-white/70">
                Start earning with our simple three-step process
              </p>
              <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                {/* Step 1 */}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                  <span className="absolute text-2xl -top-6 -left-6 inline-flex size-16 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                    1
                  </span>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <User className="h-6 w-6" />
                  </div>
                  <h3 className="text-center text-xl font-semibold text-white">Sign up</h3>
                  <p className="mt-3 text-center text-sm leading-6 text-white/70">
                    Create your account and receive your unique referral link, and start promoting your business.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-sky-300">
                    <CheckCircle className="h-6 w-6" />
                    Step 1 Complete
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden items-center justify-center md:flex">
                  <ChevronsRight className="h-6 w-6 text-sky-500" />
                 
                </div>
                {/* Step 2 */}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                  <span className="absolute text-2xl -top-6 -left-6 inline-flex size-16 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                    2
                  </span>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-center text-xl font-semibold text-white">Share your unique link</h3>
                  <p className="mt-3 text-center text-sm leading-6 text-white/70">
                    Get your custom referral link and start sharing it with your audience through channels.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-sky-300">
                      <CheckCircle className="h-6 w-6" />           
                    Step 2 Complete
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden items-center justify-center md:flex">
                  <ChevronsRight className="h-6 w-6 text-sky-500" />
                </div>
                {/* Step 3 */}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                  <span className="absolute text-2xl -top-6 -left-6 inline-flex size-16 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                    3
                  </span>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                        <ChevronsRight className="h-6 w-6" />
                  </div>
                  <h3 className="text-center text-xl font-semibold text-white">Earn 25% commission</h3>
                  <p className="mt-3 text-center text-sm leading-6 text-white/70">
                    Receive 25% commission on every referral sign-up. We&apos;ll send you payments every week.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-sky-300">
                    <CheckCircle className="h-6 w-6" />
                    Step 3 Complete
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80">
                  3 Steps to Success
                </span>
              </div>
            </div>
          </div>
        </section>


         {/* How to promote (white, Yetti theme) */}
        <section className="min-h-screen bg-white">
          <div className="mx-auto flex min-h-screen items-center max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="w-full">
              <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                How to promote <span className="text-sky-500">Yetti</span>?
              </h2>
              <p className="mt-3 text-center text-gray-600">
                Discover proven strategies to maximize your affiliate earnings
              </p>

              <div className="mt-12 space-y-6">
                {/* Card 1 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Content That Converts
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Create blog posts, reviews, or video tutorials showcasing Yetti.
                        Use your unique referral link and earn while educating your audience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Email & Community Outreach
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Share Yetti in your email newsletters, Discord servers, or online communities.
                        Perfect for creators, marketers, and business support groups.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                      <Share2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Social Sharing
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Post on social media platforms with engaging content. Average marketing
                        rate yields deliver 5+ engagements. Share that link and start earning from discovery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mx-auto mt-10 w-[300px] rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-center">
                <p className="text-gray-800">Ready to start promoting?</p>
                <Link
                  href="/auth/signup"
                  className="mt-3 inline-block rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-sky-700"
                >
                  Join Affiliate Program →
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Earnings calculator (navy, full screen) */}
        <section className="min-h-screen bg-[#0b1220]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Your <span className="text-sky-500">Earning Potential</span>
              </h2>
              <p className="mt-2 text-white/70">
                See how much you could earn with our affiliate program
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left: Calculator card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <TrendingUp className="h-5 w-5 text-sky-300" />
                  Earnings Calculator
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-medium text-white/80">Select Plan Type</label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["starter", "pro", "enterprise"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlan(p)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                            plan === p
                              ? "bg-sky-500 text-white"
                              : "bg-white/5 text-white/80 hover:bg-white/10"
                          }`}
                        >
                          {p === "starter" ? "Starter $49" : p === "pro" ? "Pro $159" : "Enterprise $279"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/80">Monthly Referrals</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={referrals}
                      onChange={(e) => setReferrals(parseInt(e.target.value, 10))}
                      className="mt-4 w-full accent-sky-500"
                    />
                    <div className="mt-2 text-sm text-white/80">Monthly Referrals: {referrals}</div>
                  </div>
                </div>
              </div>
              {/* Right: Stat cards */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">Monthly Earnings</p>
                      <p className="mt-1 text-3xl font-extrabold text-white">${monthly}</p>
                      <p className="text-xs text-white/70">
                        From {referrals} {plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : "Enterprise"} referrals
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg.white/5 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                      <LineChart className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">Yearly Projection</p>
                      <p className="mt-1 text-3xl font-extrabold text-white">${yearly}</p>
                      <p className="text-xs text-white/70">Assuming consistent referrals</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">Per Referral</p>
                      <p className="mt-1 text-3xl font-extrabold text-white">${perReferral}</p>
                      <p className="text-xs text-white/70">Monthly recurring commission</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/auth/signup"
                    className="block rounded-xl bg-sky-500 px-6 py-4 text-center font-semibold text-white transition-colors hover:bg-sky-700"
                  >
                    Join Affiliate Program
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join form (white, full screen) */}
        <section className="min-h-screen bg-white">
          <div className="mx-auto flex min-h-screen items-center max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900">Join Yetti Affiliates</h2>
              <p className="mt-2 text-gray-600">Earn 25% commission for every customer you refer.</p>
              <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">First name</label>
                  <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Last name</label>
                  <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="sm:col-span-2">
                  <Button className="h-11 w-full bg-sky-500 hover:bg-sky-700">Create Affiliate Account</Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (reuse landing style) */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Yetti.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-gray-600">
            <Link href="/#features" className="hover:text-gray-900">
              Features
            </Link>
            <Link href="/#integrations" className="hover:text-gray-900">
              Integrations
            </Link>
            <Link href="/pricing" className="hover:text-gray-900">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

