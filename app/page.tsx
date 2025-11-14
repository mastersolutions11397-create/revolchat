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
import Navigation from "@/components/Navigation";
import Pricing from "@/components/ui/pricing";
import { FAQ } from "@/components/ui/faq-section";
import Testimonials from "@/components/ui/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const caveat = Caveat({ subsets: ["latin"], weight: "700" });

function CTA() {
  const { t } = useLanguage();
  return (
    <div className="w-full py-5 px-5  text-white">
      <div className="container mx-auto">
        <div className="flex flex-col text-center rounded-2xl p-4 lg:p-14 gap-8 items-center bg-[#0b1220]">
          <div>
            <Badge className="" variant="outline">{t("cta.badge")}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
              {t("cta.title")}
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-white/70 max-w-xl">
              {t("cta.subtitle")}
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Link href="/contact">
              <Button className="gap-4 text-black" variant="outline">
                {t("cta.scheduleDemo")} <PhoneCall className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="gap-4">
                {t("cta.startTrial")} <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-linear-to-br from-slate-300/20 via-slate-200/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full bg-linear-to-br from-sky-300/10 via-sky-200/10 to-transparent blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                {t("hero.title")}
            </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="px-6 py-4 rounded-2xl text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors yetti-shadow"
                >
                  {t("hero.launchNow")}
              </Link>
                <Link href="#integrations" className="px-6 py-4 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors">
                  {t("hero.seeIntegrations")}
              </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Infinity className="w-4 h-4" />
                  <span>{t("hero.unlimitedConversations")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2Icon className="w-4 h-4" />
                  <span>{t("hero.fiveMinuteSetup")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>{t("hero.enterpriseSecurity")}</span>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-6 rounded-3xl bg-linear-to-br from-white/10 to-white/0 blur-2xl" />
              <div className="relative lg:-rotate-6">
                <div className="bg-white rounded-md border  shadow-2xl pt-6 ">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                    <Image src="/yetti/yetti_handsup.png" alt="Yetti hands up" fill className="object-contain" sizes="(max-width: 1024px) 100vw, 24rem" />
                  </div>
                  <div className={`${caveat.className} mt-3 text-gray-800 text-2xl text-center mb-4`}>
                    {t("hero.alwaysOn")}
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
              {t("centerpiece.title")}
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t("centerpiece.subtitle")}
            </p>
          </div>
          <div className="mt-10 relative flex items-center justify-center">
            <div className="relative w-[min(520px,90vw)] aspect-square">
              <Image src="/yetti/yetti_laptop.png" alt="Yetti sitting with laptop" fill className="object-contain" sizes="(max-width: 1024px) 90vw, 520px" />
          </div>

            {/* Corner callouts (desktop) */}
            <div className="hidden md:block absolute top-6 left-6 xl:left-28 xl:scale-150 transform translate-x-2 translate-y-2 rotate-6">
              <div className="yetti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><FileText size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("centerpiece.trainContent")}</p>
                    <p className="text-xs text-gray-600">{t("centerpiece.trainContentDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-6 right-6  xl:right-28 xl:scale-150 transform -translate-x-2 translate-y-2 -rotate-6">
              <div className="yetti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><Sheet size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t("centerpiece.workflowsSheets")}
                    </p>
                    <p className="text-xs text-gray-600">{t("centerpiece.workflowsSheetsDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 left-6 -rotate-6  xl:left-28 xl:scale-150 transform translate-x-2 -translate-y-2">
              <div className="yetti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><MessageSquare size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t("centerpiece.deployEverywhere")}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t("centerpiece.deployEverywhereDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-6 right-6 rotate-6  xl:right-28 xl:scale-150 transform -translate-x-2 -translate-y-2">
              <div className="yetti-card rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex-none w-8 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><BarChart3 size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("centerpiece.realTimeInsights")}</p>
                    <p className="text-xs text-gray-600">{t("centerpiece.realTimeInsightsDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile callouts */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            <div className="yetti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><FileText size={18} /></div><span className="text-sm text-gray-800 font-medium">{t("centerpiece.mobile.trainContent")}</span></div>
            <div className="yetti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><Sheet size={18} /></div><span className="text-sm text-gray-800 font-medium">{t("centerpiece.mobile.workflowsSheets")}</span></div>
            <div className="yetti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><MessageSquare size={18} /></div><span className="text-sm text-gray-800 font-medium">{t("centerpiece.mobile.deployEverywhere")}</span></div>
            <div className="yetti-card rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"><div className="flex-none w-10 aspect-square rounded-lg bg-gray-900 text-white flex items-center justify-center"><BarChart3 size={18} /></div><span className="text-sm text-gray-800 font-medium">{t("centerpiece.mobile.realTimeAnalytics")}</span></div>
          </div>
        </div>
      </section>

      {/* About */}
     
      {/* Features */}
      <section id="features" className="py-20 min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{t("features.title")}</h2>
            <p className="mt-6 text-lg md:text-xl text-white/70">{t("features.subtitle")}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { Icon: Brain, titleKey: "features.smartTraining.title", descKey: "features.smartTraining.desc" },
              { Icon: GitBranch, titleKey: "features.workflowBuilder.title", descKey: "features.workflowBuilder.desc" },
              { Icon: BarChart3, titleKey: "features.realTimeAnalytics.title", descKey: "features.realTimeAnalytics.desc" },
              { Icon: Plug, titleKey: "features.easyIntegrations.title", descKey: "features.easyIntegrations.desc" },
              { Icon: Zap, titleKey: "features.instantResponses.title", descKey: "features.instantResponses.desc" },
              { Icon: ShieldCheck, titleKey: "features.alwaysOnBrand.title", descKey: "features.alwaysOnBrand.desc" },
            ].map((f) => (
              <div key={f.titleKey} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#0ea5e9] hover:bg-white/10">
                <div className="flex items-start gap-4">
                  <div className="flex-none w-12 aspect-square rounded-xl bg-[#0ea5e9] text-white flex items-center justify-center">
                    <f.Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{t(f.titleKey)}</h3>
                    <p className="mt-2 text-base text-white/70">{t(f.descKey)}</p>
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
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">{t("integrations.title")}</h2>
            <p className="mt-6 text-lg md:text-xl text-gray-600">{t("integrations.subtitle")}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="rounded-2xl p-6  text-white bg-[linear-gradient(115deg,#f9ce34,#ee2a7b,#6228d7)]">
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.instagram.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.instagram.desc")}
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
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.messenger.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.messenger.desc")}
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
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.telegram.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.telegram.desc")}
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

    
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer variant="light" />
    </div>
  );
}
