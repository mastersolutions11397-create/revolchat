"use client";

import Link from "next/link";
import Image from "next/image";

import { Shield, Lock, Eye, FileText } from "lucide-react";
import Navbar from "../../components_lovable/Navbar";
import Footer from "../../components_lovable/Footer";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-gradient-to-br from-sky-500 to-sky-900 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center gap-12">
            <div className="text-center flex items-center justify-center flex-col animate-fade-in-up">
              <div className="w-20 h-20  bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-8 border border-white/20 shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                {t("privacy.title")}
              </h1>
              <p className="text-lg md:text-xl text-sky-100/80 font-medium">
                {t("privacy.lastUpdated")}
              </p>
            </div>
           
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-slate-200">
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">1</span>
                  {t("privacy.section1.title")}
                </h2>
                <p className="leading-relaxed">
                  {t("privacy.section1.content1")}
                </p>
                <p className="leading-relaxed">
                  {t("privacy.section1.content2")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <FileText className="w-6 h-6" />
                  </span>
                  {t("privacy.section2.title")}
                </h2>

                <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    {t("privacy.section2.subsection1.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.section2.subsection1.intro")}
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li>{t("privacy.section2.subsection1.item1")}</li>
                    <li>{t("privacy.section2.subsection1.item2")}</li>
                    <li>{t("privacy.section2.subsection1.item3")}</li>
                    <li>{t("privacy.section2.subsection1.item4")}</li>
                    <li>{t("privacy.section2.subsection1.item5")}</li>
                  </ul>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    {t("privacy.section2.subsection2.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.section2.subsection2.intro")}
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li>{t("privacy.section2.subsection2.item1")}</li>
                    <li>{t("privacy.section2.subsection2.item2")}</li>
                    <li>{t("privacy.section2.subsection2.item3")}</li>
                    <li>{t("privacy.section2.subsection2.item4")}</li>
                  </ul>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    {t("privacy.section2.subsection3.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.section2.subsection3.intro")}
                  </p>
                  <ul className="space-y-2">
                    <li>{t("privacy.section2.subsection3.item1")}</li>
                    <li>{t("privacy.section2.subsection3.item2")}</li>
                    <li>{t("privacy.section2.subsection3.item3")}</li>
                    <li>{t("privacy.section2.subsection3.item4")}</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">3</span>
                  {t("privacy.section3.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("privacy.section3.intro")}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    t("privacy.section3.item1"),
                    t("privacy.section3.item2"),
                    t("privacy.section3.item3"),
                    t("privacy.section3.item4"),
                    t("privacy.section3.item5"),
                    t("privacy.section3.item6"),
                    t("privacy.section3.item7")
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">4</span>
                  {t("privacy.section4.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("privacy.section4.intro")}
                </p>
                <ul className="space-y-2">
                  <li>{t("privacy.section4.item1")}</li>
                  <li>{t("privacy.section4.item2")}</li>
                  <li>{t("privacy.section4.item3")}</li>
                  <li>{t("privacy.section4.item4")}</li>
                  <li>{t("privacy.section4.item5")}</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <Lock className="w-6 h-6" />
                  </span>
                  {t("privacy.section5.title")}
                </h2>
                <div className="bg-sky-50 rounded-2xl p-8 border border-sky-100">
                  <p className="leading-relaxed mb-4 text-slate-700">
                    {t("privacy.section5.intro")}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      t("privacy.section5.item1"),
                      t("privacy.section5.item2"),
                      t("privacy.section5.item3"),
                      t("privacy.section5.item4"),
                      t("privacy.section5.item5")
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                        <Shield className="w-4 h-4 text-sky-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <Eye className="w-6 h-6" />
                  </span>
                  {t("privacy.section6.title")}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t("privacy.section6.intro")}
                </p>
                <ul className="space-y-2 mb-6">
                  <li>{t("privacy.section6.item1")}</li>
                  <li>{t("privacy.section6.item2")}</li>
                  <li>{t("privacy.section6.item3")}</li>
                  <li>{t("privacy.section6.item4")}</li>
                  <li>{t("privacy.section6.item5")}</li>
                  <li>{t("privacy.section6.item6")}</li>
                </ul>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900">
                  {t("privacy.section6.contactNote")}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">7</span>
                  {t("privacy.section7.title")}
                </h2>
                <p className="leading-relaxed">
                  {t("privacy.section7.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">8</span>
                  {t("privacy.section8.title")}
                </h2>
                <p className="leading-relaxed">
                  {t("privacy.section8.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">9</span>
                  {t("privacy.section9.title")}
                </h2>
                <p className="leading-relaxed">
                  {t("privacy.section9.content")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">10</span>
                  {t("privacy.section10.title")}
                </h2>
                <p className="leading-relaxed">
                  {t("privacy.section10.content")}
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">11</span>
                  {t("privacy.section11.title")}
                </h2>
                <p className="leading-relaxed mb-6">
                  {t("privacy.section11.intro")}
                </p>
                <div className="bg-sky-500 text-white p-8 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-slate-200 text-sm mb-1 uppercase tracking-wider font-semibold">{t("privacy.section11.email")}</p>
                      <p className="font-medium text-lg">{t("privacy.section11.emailValue")}</p>
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm mb-1 uppercase tracking-wider font-semibold">{t("privacy.section11.address")}</p>
                      <p className="font-medium text-lg">{t("privacy.section11.addressValue")}</p>
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm mb-1 uppercase tracking-wider font-semibold">{t("privacy.section11.phone")}</p>
                      <p className="font-medium text-lg">{t("privacy.section11.phoneValue")}</p>
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