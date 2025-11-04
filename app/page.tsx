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
  MoveRight,
  PhoneCall,
} from "lucide-react";
import { Caveat } from "next/font/google";
import Pricing from "@/components/ui/pricing";
import { FAQ } from "@/components/ui/faq-section";
import Testimonials from "@/components/ui/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const caveat = Caveat({ subsets: ["latin"], weight: "700" });

function CTA() {
  return (
    <div className="w-full py-20   text-white">
      <div className="container mx-auto">
        <div className="flex flex-col text-center rounded-md p-4 lg:p-14 gap-8 items-center bg-[#0f1a2b]">
          <div>
            <Badge className="" variant="outline">Get started</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
              Try our platform today!
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-white/70 max-w-xl">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our goal
              is to streamline SMB trade, making it easier and faster than ever.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button className="gap-4  text-black!" variant="outline">
              Jump on a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button className="gap-4  ">
              Sign up here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200/60 bg-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">YETTI<span className="text-gray-400">.AI</span></span>
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
                className="px-4 py-2 rounded-xl text-white bg-[#5170ff] hover:bg-[#4a68f0] transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)]"
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
                Yetti responds on your behalf across Instagram, Facebook Messenger, and Telegram. Train with PDF, text, and Google Sheets. Build flows in Sheets—Yetti follows them perfectly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="px-6 py-4 rounded-2xl text-white bg-[#5170ff] hover:bg-[#4a68f0] transition-colors yeti-shadow"
                >
                  Launch Yetti Now
              </Link>
                <Link href="#integrations" className="px-6 py-4 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors">
                  See Integrations
              </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2"><span>⚡</span><span>Unlimited usage credits</span></div>
                <div className="flex items-center gap-2"><span>🔗</span><span>Plug-and-play setup</span></div>
                <div className="flex items-center gap-2"><span>🔒</span><span>Secure by default</span></div>
              </div>
            </div>
            <div className="relative w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-6 rounded-3xl bg-linear-to-br from-white/10 to-white/0 blur-2xl" />
              <div className="relative -rotate-6">
                <div className="bg-white rounded-md border  shadow-2xl pt-6 ">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                    <Image src="/yetti/yetti_handsup.png" alt="Yetti hands up" fill className="object-contain" sizes="(max-width: 1024px) 100vw, 24rem" />
                  </div>
                  <div className={`${caveat.className} mt-3 text-gray-800 text-2xl text-center mb-4`}>
                    Always on for your business
                  </div>

                   <div className="absolute bottom-0 right-0 w-42 translate-x-[25%] aspect-square rounded-md overflow-hidden ">
                    <Image src="/yetti/logo.png" alt="Yetti hands up" fill className="object-contain"  />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Centerpiece - full screen with laptop Yetti */}
      <section id="centerpiece" className="relative min-h-screen py-20 sm:py-28 bg-white overflow-hidden">
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
              <Image src="/yetti/yetti_laptop.png" alt="Yetti sitting with laptop" fill className="object-contain" sizes="(max-width: 1024px) 90vw, 520px" />
          </div>

            {/* Corner callouts (desktop) */}
            <div className="hidden md:block absolute top-6 left-6 xl:left-28 xl:scale-150 transform translate-x-2 translate-y-2 rotate-6">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><FileText size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">PDF & Text</p>
                    <p className="text-xs text-gray-600">Train in minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-6 right-6  xl:right-28 xl:scale-150 transform -translate-x-2 translate-y-2 -rotate-6">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><Sheet size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Google Sheets 
                    </p>
                    <p className="text-xs text-gray-600">No code required</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 left-6 -rotate-6  xl:left-28 xl:scale-150 transform translate-x-2 -translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><MessageSquare size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Multi-channels
                    </p>
                    <p className="text-xs text-gray-600">
                      Insta, Messenger, Telegram
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 right-6 rotate-6  xl:right-28 xl:scale-150 transform -translate-x-2 -translate-y-2">
              <div className="yeti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><BarChart3 size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Analytics & Credits</p>
                    <p className="text-xs text-gray-600">Track impact live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile callouts */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><FileText size={18} /></div><span className="text-sm text-gray-800 font-medium">PDF & Text — Train in minutes</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><Sheet size={18} /></div><span className="text-sm text-gray-800 font-medium">Google Sheets Flows — No code</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><MessageSquare size={18} /></div><span className="text-sm text-gray-800 font-medium">Omnichannel Deploy</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><BarChart3 size={18} /></div><span className="text-sm text-gray-800 font-medium">Analytics & Credits</span></div>
          </div>
        </div>
      </section>

      {/* About */}
     
      {/* Features */}
      <section id="features" className="py-20 min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to scale conversations</h2>
            <p className="mt-4 text-white/70">Automate replies, recover abandoned carts, and route complex chats to flows you design.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { Icon: Brain, title: "Agent Brain", desc: "Train with PDFs, text, and Google Sheets in minutes." },
              { Icon: GitBranch, title: "Flows in Sheets", desc: "Model your business logic and FAQs—no code required." },
              { Icon: BarChart3, title: "Analytics", desc: "Dashboard tracks traffic, responses, and credit usage." },
              { Icon: Plug, title: "Plug‑ins", desc: "Connect catalogs, order systems, and custom APIs." },
              { Icon: Zap, title: "Real‑time", desc: "Instant responses across channels with safe fallbacks." },
              { Icon: ShieldCheck, title: "Safe & On‑brand", desc: "Guardrails ensure answers stay accurate and on‑brand." },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#5170ff] hover:bg-white/10">
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
      <section id="integrations" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Deploy Yetti where your customers are</h2>
            <p className="mt-4 text-gray-600">Instagram, Facebook Messenger, and Telegram—set up in minutes.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="rounded-2xl p-6  text-white bg-[linear-gradient(115deg,#f9ce34,#ee2a7b,#6228d7)]">
              <h3 className="text-3xl font-bold">Instagram</h3>
              <p className="mt-1 text-white/90">
                DMs, comments, stories—fully automated, always on‑brand.
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mt-4">
                <Image
                  src="/yetti/yetti_instagram.png"
                  alt="Yetti Instagram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
            <div className="rounded-2xl p-6 text-white bg-[linear-gradient(135deg,#0766ff,#0045cc)]">
              <h3 className="text-3xl font-bold">Messenger</h3>
              <p className="mt-1 text-white/90">
                Recover carts, answer FAQs, and route to human when needed.
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mt-4">
                <Image
                  src="/yetti/yetti_messanger.png"
                  alt="Yetti Messenger"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
            <div className="rounded-2xl p-6 text-white bg-[linear-gradient(135deg,#00a8e8,#0088cc)]">
              <h3 className="text-3xl font-bold">Telegram</h3>
              <p className="mt-1 text-white/90">
                High-volume conversations handled safely and instantly.
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mt-4">
                <Image
                  src="/yetti/yetti_telegram.png"
                  alt="Yetti Telegram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* shadcn Testimonials component */}
      <Testimonials />

      {/* shadcn Pricing component */}
      <Pricing />

      {/* shadcn FAQ component */}
      <FAQ />


      {/* Final CTA */}
      <CTA />

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500">© {new Date().getFullYear()} Yetti.ai. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-600">
            <Link href="#features" className="hover:text-gray-900">Features</Link>
            <Link href="#integrations" className="hover:text-gray-900">Integrations</Link>
            <Link href="#pricing" className="hover:text-gray-900">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
