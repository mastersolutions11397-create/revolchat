"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Sheet,
  MessageSquare,
  BarChart3,
  Brain,
  GitBranch,
  Plug,
  Zap,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { Caveat } from "next/font/google";
import Footer from "@/components/Footer";

const caveat = Caveat({ subsets: ["latin"], weight: "700" });

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200/60 bg-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                YETTI<span className="text-gray-400">.AI</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#integrations"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Integrations
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-linear-to-br from-slate-300/20 via-slate-200/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full bg-linear-to-br from-indigo-300/10 via-blue-200/10 to-transparent blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Deploy an AI Agent that runs your store while you sleep
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300">
                Yetti responds on your behalf across Instagram, Facebook
                Messenger, and Telegram. Train with PDF, text, and Google
                Sheets. Build flows in Sheets—Yetti follows them perfectly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="px-6 py-4 rounded-2xl text-gray-900 bg-white hover:bg-gray-100 transition-colors yeti-shadow"
                >
                  Launch Yetti Now
                </Link>
                <Link
                  href="#integrations"
                  className="px-6 py-4 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  See Integrations
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Unlimited usage credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔗</span>
                  <span>Plug-and-play setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure by default</span>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-6 rounded-3xl bg-linear-to-br from-white/10 to-white/0 blur-2xl" />
              <div className="relative -rotate-6">
                <div className="bg-white rounded-md border  shadow-2xl pt-6 ">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                    <Image
                      src="/yetti/yetti_handsup.png"
                      alt="Yetti hands up"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 24rem"
                    />
                  </div>
                  <div
                    className={`${caveat.className} mt-3 text-gray-800 text-2xl text-center mb-4`}
                  >
                    Always on for your business
                  </div>

                  <div className="absolute bottom-0 right-0 w-42 translate-x-[25%] aspect-square rounded-md overflow-hidden ">
                    <Image
                      src="/yetti/logo.png"
                      alt="Yetti hands up"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Centerpiece - full screen with laptop Yetti */}
      <section
        id="centerpiece"
        className="relative min-h-screen py-20 sm:py-28 bg-white overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_-100px,rgba(15,23,42,0.06),transparent_70%)]" />
          <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-linear-to-br from-slate-200/50 to-transparent blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-center text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Meet Yetti — your 24/7 ecommerce copilot
          </h2>
          <div className="mt-10 relative flex items-center justify-center">
            <div className="relative w-[min(520px,90vw)] aspect-square">
              <Image
                src="/yetti/yetti_laptop.png"
                alt="Yetti sitting with laptop"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 90vw, 520px"
              />
            </div>

            {/* Corner callouts (desktop) */}
            <div className="hidden md:block absolute top-6 left-6 transform translate-x-2 translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      PDF & Text
                    </p>
                    <p className="text-xs text-gray-600">Train in minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-6 right-6 transform -translate-x-2 translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <Sheet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Google Sheets Flows
                    </p>
                    <p className="text-xs text-gray-600">No code required</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 left-6 transform translate-x-2 -translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Omnichannel Deploy
                    </p>
                    <p className="text-xs text-gray-600">
                      Instagram, Messenger, Telegram
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 right-6 transform -translate-x-2 -translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Analytics & Credits
                    </p>
                    <p className="text-xs text-gray-600">Track impact live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile callouts */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <FileText size={18} />
              </div>
              <span className="text-sm text-gray-800 font-medium">
                PDF & Text — Train in minutes
              </span>
            </div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <Sheet size={18} />
              </div>
              <span className="text-sm text-gray-800 font-medium">
                Google Sheets Flows — No code
              </span>
            </div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <span className="text-sm text-gray-800 font-medium">
                Omnichannel Deploy
              </span>
            </div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <span className="text-sm text-gray-800 font-medium">
                Analytics & Credits
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}

      {/* Features */}
      <section
        id="features"
        className="py-20 min-h-screen flex items-center justify-center bg-[#0b1220] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to scale conversations
            </h2>
            <p className="mt-4 text-white/70">
              Automate replies, recover abandoned carts, and route complex chats
              to flows you design.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                Icon: Brain,
                title: "Agent Brain",
                desc: "Train with PDFs, text, and Google Sheets in minutes.",
              },
              {
                Icon: GitBranch,
                title: "Flows in Sheets",
                desc: "Model your business logic and FAQs—no code required.",
              },
              {
                Icon: BarChart3,
                title: "Analytics",
                desc: "Dashboard tracks traffic, responses, and credit usage.",
              },
              {
                Icon: Plug,
                title: "Plug‑ins",
                desc: "Connect catalogs, order systems, and custom APIs.",
              },
              {
                Icon: Zap,
                title: "Real‑time",
                desc: "Instant responses across channels with safe fallbacks.",
              },
              {
                Icon: ShieldCheck,
                title: "Safe & On‑brand",
                desc: "Guardrails ensure answers stay accurate and on‑brand.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#5170ff] hover:bg-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-none w-12 aspect-square rounded-xl bg-[#5170ff] text-white flex items-center justify-center">
                    <f.Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-white/70">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations with Yetti images */}
      <section id="integrations" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Deploy Yetti where your customers are
            </h2>
            <p className="mt-4 text-gray-600">
              Instagram, Facebook Messenger, and Telegram—set up in minutes.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="yeti-card rounded-2xl p-6 border border-gray-200">
              <div className="relative w-full aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden">
                <Image
                  src="/yetti/yetti_instagram.png"
                  alt="Yetti Instagram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Instagram
              </h3>
              <p className="mt-1 text-gray-600">
                DMs, comments, stories—fully automated, always on-brand.
              </p>
            </div>
            <div className="yeti-card rounded-2xl p-6 border border-gray-200">
              <div className="relative w-full aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden">
                <Image
                  src="/yetti/yetti_messanger.png"
                  alt="Yetti Messenger"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Messenger
              </h3>
              <p className="mt-1 text-gray-600">
                Recover carts, answer FAQs, and route to human when needed.
              </p>
            </div>
            <div className="yeti-card rounded-2xl p-6 border border-gray-200">
              <div className="relative w-full aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden">
                <Image
                  src="/yetti/yetti_telegram.png"
                  alt="Yetti Telegram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Telegram
              </h3>
              <p className="mt-1 text-gray-600">
                High-volume conversations handled safely and instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#c0c2d6]/30  text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute -top-24 -right-32 w-[420px] h-[420px] rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -left-32 w-[420px] h-[420px] rounded-full bg-white blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-gray-900 font-bold">
              Loved by modern ecommerce teams
            </h2>
            <p className="mt-3 text-black">
              Real results from brands using Yetti to automate conversations
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: "Yetti doubled our response rate on Instagram.",
                name: "Ava — Boutique Owner",
              },
              {
                quote: "Flows in Sheets changed everything—zero dev time.",
                name: "Marco — DTC Ops",
              },
              {
                quote: "We sell while we sleep. The dashboard is gold.",
                name: "Nora — Ecommerce Lead",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/25 bg-gray-900 p-6 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-none w-9 aspect-square rounded-lg bg-white text-[#5170ff] flex items-center justify-center">
                    <Quote size={18} />
                  </div>
                  <div className="text-sm text-white/80">★★★★★</div>
                </div>
                <p className="mt-4 text-lg">“{t.quote}”</p>
                <p className="mt-4 text-sm text-white/80">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
            {[
              {
                q: "How do I train Yetti?",
                a: "Upload PDFs, paste text, or connect a Google Sheet. You can also define flows directly in Sheets—Yetti follows them step-by-step.",
              },
              {
                q: "Which platforms are supported?",
                a: "Instagram, Facebook Messenger, and Telegram. More coming soon.",
              },
              {
                q: "Is there a dashboard?",
                a: "Yes. The dashboard shows traffic, conversations, and credit usage in real time.",
              },
              {
                q: "What does pricing include?",
                a: "$59/month includes unlimited usage credits for a single workspace.",
              },
            ].map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left">
                  <span className="text-gray-900 font-medium">{f.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ⌄
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple pricing
            </h2>
            <p className="mt-4 text-gray-600">
              Unlimited usage credits. Cancel anytime.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="yeti-card rounded-3xl p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Yetti Pro</h3>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-gray-900">
                  $59
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-gray-700">
                <li>✔ Unlimited usage credits</li>
                <li>✔ Instagram, Messenger, Telegram</li>
                <li>✔ PDF, Text, Google Sheets training</li>
                <li>✔ Analytics dashboard</li>
                <li>✔ Email support</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/auth/signup"
                  className="flex-1 px-6 py-4 rounded-2xl text-white bg-gray-900 hover:bg-gray-800 text-center transition-colors"
                >
                  Start for $59
                </Link>
                <Link
                  href="/plans"
                  className="flex-1 px-6 py-4 rounded-2xl border border-gray-300 text-gray-800 hover:bg-gray-50 text-center transition-colors"
                >
                  See details
                </Link>
              </div>
            </div>
            <div className="rounded-3xl p-8 border border-dashed border-gray-300 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                What you get
              </h3>
              <p className="mt-3 text-gray-600">
                Everything required to run your ecommerce conversations
                end-to-end with Yetti.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  "Sheet flows",
                  "Brand guardrails",
                  "Fast setup",
                  "No code",
                  "Secure storage",
                  "Team access",
                ].map((x) => (
                  <div
                    key={x}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span>✓</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-10 sm:p-14 bg-linear-to-br from-gray-800 to-gray-900 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold">
                  Let Yetti work while you sleep
                </h3>
                <p className="mt-4 text-gray-300">
                  Deploy in minutes. Watch conversations, traffic, and credits
                  in your dashboard.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/signup"
                    className="px-6 py-4 rounded-2xl text-gray-900 bg-white hover:bg-gray-100 text-center transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-6 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 text-center transition-colors"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
              <div className="relative w-full aspect-5/3 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <Image
                  src="/yetti/yetti_messanger.png"
                  alt="Yetti with Messenger"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
