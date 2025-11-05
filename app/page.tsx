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
  Infinity,
  Link2 as Link2Icon,
  Lock,
} from "lucide-react";
import { Caveat } from "next/font/google";
import Footer from "@/components/Footer";
import Pricing from "@/components/ui/pricing";
import { FAQ } from "@/components/ui/faq-section";
import Testimonials from "@/components/ui/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewsletterSignup from "@/components/NewsletterSignup";

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
              Ready to Scale Your Conversations?
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-white/70 max-w-xl">
              Join thousands of businesses using Yetti 24/7. Stop losing sales to slow responses. Start converting today.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Link href="/contact">
              <Button className="gap-4 text-black" variant="outline">
                Schedule a Demo <PhoneCall className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="gap-4">
                Start Free Trial <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
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
                Your AI Agent That Never Sleeps
            </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300">
                Handle customer conversations 24/7 on Instagram, Messenger, and Telegram. Train with PDFs, build workflows in Sheets—no coding required.
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
                <div className="flex items-center gap-2">
                  <Infinity className="w-4 h-4" />
                  <span>Unlimited conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2Icon className="w-4 h-4" />
                  <span>5-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Enterprise-grade security</span>
                </div>
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
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Meet Yetti — Your AI That Understands Your Business
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              No coding required. Train with your content, build workflows in Sheets, and let Yetti handle conversations like your best team member.
            </p>
          </div>
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
                    <p className="text-sm font-semibold text-gray-900">Train with Content</p>
                    <p className="text-xs text-gray-600">PDFs or text—done in 5 minutes</p>
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
                      Workflows in Sheets
                    </p>
                    <p className="text-xs text-gray-600">No coding required</p>
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
                      Deploy Everywhere
                    </p>
                    <p className="text-xs text-gray-600">
                      One agent, multiple platforms
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
                    <p className="text-sm font-semibold text-gray-900">Real-Time Insights</p>
                    <p className="text-xs text-gray-600">Track performance live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile callouts */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><FileText size={18} /></div><span className="text-sm text-gray-800 font-medium">Train with Content — 5 minutes</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><Sheet size={18} /></div><span className="text-sm text-gray-800 font-medium">Workflows in Sheets — No coding</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><MessageSquare size={18} /></div><span className="text-sm text-gray-800 font-medium">Deploy Everywhere — Multiple platforms</span></div>
            <div className="yeti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><BarChart3 size={18} /></div><span className="text-sm text-gray-800 font-medium">Real-Time Analytics — Track performance</span></div>
          </div>
        </div>
      </section>

      {/* About */}
     
      {/* Features */}
      <section id="features" className="py-20 min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Turn Conversations Into Revenue</h2>
            <p className="mt-4 text-white/70">Instant replies, cart recovery, custom workflows—all without coding.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { Icon: Brain, title: "Smart Training", desc: "Upload PDFs or connect Sheets. Yetti learns your brand in minutes." },
              { Icon: GitBranch, title: "Workflow Builder", desc: "Build conversation flows in Google Sheets—no coding required." },
              { Icon: BarChart3, title: "Real-Time Analytics", desc: "Track response times, conversions, and revenue impact in one dashboard." },
              { Icon: Plug, title: "Easy Integrations", desc: "Connect ecommerce, CRM, and APIs. Yetti becomes your central hub." },
              { Icon: Zap, title: "Instant Responses", desc: "Millisecond replies boost satisfaction and sales." },
              { Icon: ShieldCheck, title: "Always On-Brand", desc: "Built-in guardrails keep responses accurate and trustworthy." },
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Deploy Where Your Customers Are</h2>
            <p className="mt-4 text-lg text-gray-600">Instagram, Messenger, and Telegram—Yetti engages 24/7 with quality you can trust.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="rounded-2xl p-6  text-white bg-[linear-gradient(115deg,#f9ce34,#ee2a7b,#6228d7)]">
              <h3 className="text-3xl font-bold">Instagram</h3>
              <p className="mt-2 text-white/90 leading-relaxed">
                Automate DMs, comments, and stories. Convert followers into customers—automatically.
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
              <p className="mt-2 text-white/90 leading-relaxed">
                Recover abandoned carts, answer FAQs instantly, and route complex issues to your team.
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
              <p className="mt-2 text-white/90 leading-relaxed">
                Handle thousands of conversations simultaneously. Enterprise capacity at startup prices.
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

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get AI agent tips, new features, and insights delivered to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
