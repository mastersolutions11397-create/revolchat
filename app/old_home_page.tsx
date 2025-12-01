"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Sheet,
  MessageSquare,
  BarChart3,
  Zap,
  MoveRight,
  PhoneCall,
  Clock,
  Moon,
  Calendar,
} from "lucide-react";
import { Caveat } from "next/font/google";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Pricing from "@/components/ui/pricing";
import { FAQ } from "@/components/ui/faq-section";
import { Testimonials } from "@/components/ui/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShaderBackground } from "@/components/ui/hero-shader";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const caveat = Caveat({ subsets: ["latin"], weight: "700" });

function CTA() {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-slate-50 relative flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl bg-slate-900 px-6 py-16 md:py-24 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <Badge variant="secondary" className="mb-6 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border-sky-500/20 px-4 py-1">
              {t("cta.badge")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-sky-500 text-white hover:bg-sky-500 transition-all duration-300 font-bold px-8 h-14 text-lg shadow-lg shadow-sky-500/25 hover:-translate-y-0.5">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-white/10 hover:text-white transition-all duration-300 h-14 px-8 text-lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-sm text-slate-400">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero */}
      
      
        <div className="relative z-20 flex bg-white items-center justify-center min-h-screen pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-sky-100/50 rounded-full blur-3xl opacity-70" />
             <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-slate-50/50 rounded-full blur-3xl opacity-60" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              <div>
                <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-800 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-sky-500 mr-2"></span>
                  New: AI Auto-Booking
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
                  {t("hero.subtitle")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 rounded-xl text-white bg-sky-500 hover:bg-sky-500 transition-all shadow-lg shadow-sky-500/25 font-semibold text-lg">
                   Lets Get Started
                  </button>
                  <button className="px-8 py-4 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-lg flex items-center justify-center gap-2">
                    <PhoneCall size={18} /> Book a Demo
                  </button>
                </div>
                <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <p>Trusted by 10+ businesses</p>
                </div>
              </div>
              <div className="relative lg:h-[600px] flex items-center justify-center">
                 {/* Placeholder for Hero Image/Illustration - keeping it simple for now or using the laptop image if appropriate, 
                     but the design request asked for "aesthetic". Let's use a nice abstract composition or the laptop if it fits. 
                     For now, I'll leave the structure ready for an image or use a placeholder. 
                     Actually, the previous code didn't have an image in the second column, just an empty div? 
                     Ah, looking at the original code, the second column was empty! 
                     Let's add a visual element here. */}
                 <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-tr from-sky-100 to-slate-100 rounded-3xl rotate-3 border border-slate-100 shadow-2xl p-4">
                    <div className="absolute inset-0 bg-white rounded-3xl -rotate-3 shadow-xl border border-slate-100 overflow-hidden flex items-center justify-center">
                        <Image src="/yetti/yetti_laptop.png" alt="Dashboard Preview" width={600} height={400} className="object-cover" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div> 
      

      {/* Centerpiece - What Yetti Can Do */}
      <section id="centerpiece" className="relative py-24 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              What Yetti Can Do
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Turn curious followers into paying customers with our intelligent automation suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Smart Collection */}
            <div className="col-span-1 md:col-span-2 bg-sky-50 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl transition-all duration-500 border border-sky-100">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-sky-500/30">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Smart Data Collection</h3>
                <p className="text-lg text-slate-600 mb-8">
                  Automatically capture leads from Instagram DMs and comments. Yetti identifies potential customers and starts the conversation for you.
                </p>
                <div className="flex items-center gap-2 text-sky-500 font-semibold group-hover:translate-x-2 transition-transform cursor-pointer">
                  Learn more <MoveRight size={18} />
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full translate-x-1/4 translate-y-1/4 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                 {/* Abstract UI representation */}
                 <div className="w-full h-full bg-white rounded-tl-3xl shadow-2xl border border-slate-100 p-6">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                          <div className="h-4 w-32 bg-slate-100 rounded"></div>
                       </div>
                       <div className="h-20 w-full bg-slate-50 rounded-xl"></div>
                       <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Feature 2 - Direct Booking */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl transition-all duration-500 text-white">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20">
                  <Calendar size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Direct Booking</h3>
                <p className="text-slate-300 mb-8">
                  Let customers book appointments directly within the chat interface. No more back-and-forth links.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-sky-500/30 rounded-full blur-3xl group-hover:bg-sky-500/50 transition-colors"></div>
            </div>

            {/* Feature 3 - 24/7 Support */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:border-sky-200">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">24/7 Support</h3>
                <p className="text-slate-600">
                  Answer common questions about shipping, returns, and products instantly, any time of day.
                </p>
              </div>
            </div>

            {/* Feature 4 - Analytics */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-sky-500 to-sky-500 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl transition-all duration-500 text-white">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">70% Reduction in Support Load</h3>
                  <p className="text-sky-100 text-lg mb-6">
                    Drastically reduce the time your team spends on repetitive queries. Focus on high-value interactions.
                  </p>
                  <button className="bg-white text-sky-500 px-6 py-3 rounded-xl font-semibold hover:bg-sky-50 transition-colors">
                    View Case Studies
                  </button>
                </div>
                <div className="flex-1 w-full">
                   {/* Simple chart representation */}
                   <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-end gap-2 h-32">
                         <div className="w-full bg-white/30 rounded-t-lg h-[40%]"></div>
                         <div className="w-full bg-white/40 rounded-t-lg h-[60%]"></div>
                         <div className="w-full bg-white/60 rounded-t-lg h-[50%]"></div>
                         <div className="w-full bg-white/80 rounded-t-lg h-[80%]"></div>
                         <div className="w-full bg-white rounded-t-lg h-[95%]"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
     
      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up delay-100">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">{t("features.title")}</h2>
            <p className="mt-6 text-lg md:text-xl text-slate-600">{t("features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: Zap, title: "Instant Replies", desc: "Respond to customer inquiries immediately with AI-powered automation." },
              { Icon: MessageSquare, title: "Lead Capture", desc: "Automatically collect and organize customer information from conversations." },
              { Icon: Calendar, title: "Booking Appointments", desc: "Handle appointment scheduling directly through chat with calendar sync." },
              { Icon: Clock, title: "24/7 Availability", desc: "Your AI assistant never sleeps, providing round-the-clock support." },
              { Icon: Moon, title: "Works while you sleep", desc: "Continue generating leads and handling interactions even when you're offline." },
              { Icon: Sheet, title: "CRM Integration", desc: "Seamlessly sync all data with your favorite CRM tools for unified management." },
            ].map((f, i) => (
              <div key={f.title} className={`group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-sky-200 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${(i % 3 + 1) * 100}`}>
                <div className="w-14 h-14 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                  <f.Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations with Yetti images */}
      <section id="integrations" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">{t("integrations.title")}</h2>
            <p className="mt-6 text-lg md:text-xl text-gray-600">{t("integrations.subtitle")}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up delay-200">
            <div className="rounded-2xl p-6 flex flex-col  text-white bg-[linear-gradient(115deg,#f9ce34,#ee2a7b,#6228d7)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.instagram.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.instagram.desc")}
              </p>
               <div className="relative self-end aspect-square bg-white rounded-full w-[70px] h-[70px] overflow-hidden mt-4 shadow-md">
                <Image src="/yetti/insta_logo.png" alt="Yetti Telegram" fill className="object-contain scale-[0.8]" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              
            </div>
            <div className="rounded-2xl p-6 text-white bg-[linear-gradient(135deg,#0766ff,#0045cc)] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.messenger.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.messenger.desc")}
              </p>
               <div className="relative self-end aspect-square bg-white rounded-full w-[70px] h-[70px] overflow-hidden mt-4 shadow-md">
                <Image src="/yetti/communication.png" alt="Yetti Telegram" fill className="object-contain scale-[0.8]" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              
            </div>
            <div className="rounded-2xl p-6 text-white bg-[linear-gradient(135deg,#00a8e8,#0088cc)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold">{t("integrations.telegram.title")}</h3>
              <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed">
                {t("integrations.telegram.desc")}
              </p>
              <div className="relative self-end aspect-square bg-white rounded-full w-[70px] h-[70px] overflow-hidden mt-4 shadow-md">
                <Image src="/yetti/telegram_logo.png" alt="Yetti Telegram" fill className="object-contain scale-[0.6]" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

            </div>
          </div>
        </div>
      </section>

    
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
