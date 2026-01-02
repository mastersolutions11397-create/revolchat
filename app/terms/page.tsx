"use client";

import Link from "next/link";
import Image from "next/image";

import Navigation from "@/components/Navigation";
import { FileText, Scale, Shield, CheckCircle2 } from "lucide-react";
import Navbar from "../../components_lovable/Navbar";
import Footer from "../../components_lovable/Footer";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function TermsOfServicePage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>

      {/* Hero Section */}
      <section className="relative pt-42 pb-20 overflow-hidden bg-gradient-to-tr from-sky-500 to-sky-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl flex flex-col items-center justify-center mx-auto">
            <div className="w-20 h-20  bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-8 border border-white/20 shadow-xl">
                <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
              {t("terms.title")}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-fade-in-up delay-200">
              {t("terms.lastUpdated")}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-slate-200">
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </span>
                  {t("terms.section1.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section1.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">2</span>
                  {t("terms.section2.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section2.content1")}
                </p>
                <p className="leading-relaxed">
                  {t("terms.section2.content2")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">3</span>
                  {t("terms.section3.title")}
                </h2>
                <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    {t("terms.section3.subsection1.title")}
                  </h3>
                  <p className="mb-6">
                    {t("terms.section3.subsection1.content")}
                  </p>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    {t("terms.section3.subsection2.title")}
                  </h3>
                  <p className="mb-0">
                    {t("terms.section3.subsection2.content")}
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">4</span>
                  {t("terms.section4.title")}
                </h2>
                
                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  {t("terms.section4.subsection1.title")}
                </h3>
                <p className="leading-relaxed mb-4">
                  {t("terms.section4.subsection1.intro")}
                </p>
                <ul className="space-y-2 mb-8">
                  <li>{t("terms.section4.subsection1.item1")}</li>
                  <li>{t("terms.section4.subsection1.item2")}</li>
                  <li>{t("terms.section4.subsection1.item3")}</li>
                  <li>{t("terms.section4.subsection1.item4")}</li>
                </ul>

                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  {t("terms.section4.subsection2.title")}
                </h3>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-900">
                  <p className="font-semibold mb-4">{t("terms.section4.subsection2.intro")}</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>{t("terms.section4.subsection2.item1")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>{t("terms.section4.subsection2.item2")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>{t("terms.section4.subsection2.item3")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>{t("terms.section4.subsection2.item4")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>{t("terms.section4.subsection2.item5")}</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">5</span>
                  {t("terms.section5.title")}
                </h2>
                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  {t("terms.section5.subsection1.title")}
                </h3>
                <p className="leading-relaxed mb-6">
                  {t("terms.section5.subsection1.content")}
                </p>

                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  {t("terms.section5.subsection2.title")}
                </h3>
                <p className="leading-relaxed mb-4">
                  {t("terms.section5.subsection2.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">6</span>
                  {t("terms.section6.title")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">{t("terms.section6.subsection1.title")}</h3>
                    <p className="text-sm text-slate-600">{t("terms.section6.subsection1.content")}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">{t("terms.section6.subsection2.title")}</h3>
                    <p className="text-sm text-slate-600">{t("terms.section6.subsection2.content")}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">{t("terms.section6.subsection3.title")}</h3>
                    <p className="text-sm text-slate-600">{t("terms.section6.subsection3.content")}</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <Shield className="w-6 h-6" />
                  </span>
                  {t("terms.section7.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section7.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">8</span>
                  {t("terms.section8.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section8.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">9</span>
                  {t("terms.section9.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section9.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">10</span>
                  {t("terms.section10.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section10.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">11</span>
                  {t("terms.section11.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section11.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">12</span>
                  {t("terms.section12.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section12.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">13</span>
                  {t("terms.section13.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("terms.section13.content")}
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">14</span>
                  {t("terms.section14.title")}
                </h2>
                <p className="leading-relaxed mb-6">
                  {t("terms.section14.intro")}
                </p>
                <div className="bg-sky-500 text-white p-8 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t("terms.section14.email")}</p>
                      <p className="font-medium text-lg">{t("terms.section14.emailValue")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t("terms.section14.address")}</p>
                      <p className="font-medium text-lg">{t("terms.section14.addressValue")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t("terms.section14.phone")}</p>
                      <p className="font-medium text-lg">{t("terms.section14.phoneValue")}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      <Footer/>

      
    </div>
  );
}