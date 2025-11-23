import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { FileText, Scale, Shield, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation darkBackground={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Legal
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Service</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-fade-in-up delay-200">
              Last updated: December 15, 2024
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
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </span>
                  1. Acceptance of Terms
                </h2>
                <p className="leading-relaxed mb-4">
                  By accessing and using yetti AI's services, you accept and agree
                  to be bound by the terms and provision of this agreement. If you
                  do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">2</span>
                  Description of Service
                </h2>
                <p className="leading-relaxed mb-4">
                  yetti AI provides an AI integration platform that allows users to
                  connect their AI agents to various social media and messaging
                  platforms including but not limited to Instagram, Telegram,
                  WhatsApp, and other third-party services.
                </p>
                <p className="leading-relaxed">
                  Our service includes tools for creating, managing, and deploying
                  AI agents, as well as analytics and monitoring capabilities.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">3</span>
                  User Accounts
                </h2>
                <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    3.1 Account Creation
                  </h3>
                  <p className="mb-6">
                    To use our services, you must create an account. You agree to
                    provide accurate, current, and complete information during the
                    registration process and to update such information to keep it
                    accurate, current, and complete.
                  </p>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    3.2 Account Security
                  </h3>
                  <p className="mb-0">
                    You are responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under your
                    account. You agree to notify us immediately of any unauthorized
                    use of your account.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">4</span>
                  Acceptable Use
                </h2>
                
                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  4.1 Permitted Uses
                </h3>
                <p className="leading-relaxed mb-4">
                  You may use our services only for lawful purposes and in
                  accordance with these Terms. You agree not to use our services:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                  <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
                </ul>

                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  4.2 Prohibited Activities
                </h3>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-900">
                  <p className="font-semibold mb-4">You agree not to:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>Use our services to create, distribute, or facilitate spam, malware, or other harmful content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>Attempt to gain unauthorized access to any portion of our services or any other systems or networks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>Use automated means to access our services for any purpose without our express written permission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>Interfere with or disrupt our services or servers or networks connected to our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                      <span>Use our services to violate the terms of service of any third-party platform</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">5</span>
                  Intellectual Property Rights
                </h2>
                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  5.1 Our Rights
                </h3>
                <p className="leading-relaxed mb-6">
                  The service and its original content, features, and
                  functionality are and will remain the exclusive property of yetti
                  AI and its licensors. The service is protected by copyright,
                  trademark, and other laws.
                </p>

                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  5.2 Your Content
                </h3>
                <p className="leading-relaxed mb-4">
                  You retain ownership of any content you create, upload, or share
                  through our services. By using our services, you grant us a
                  limited, non-exclusive, royalty-free license to use, modify, and
                  distribute your content solely for the purpose of providing our
                  services.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">6</span>
                  Payment Terms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">Subscription Fees</h3>
                    <p className="text-sm text-slate-600">Some features are provided for a fee. You agree to pay all applicable fees as described at the time of purchase.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">Billing & Renewal</h3>
                    <p className="text-sm text-slate-600">Fees are billed in advance. Subscriptions automatically renew unless canceled before the billing period ends.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">Refunds</h3>
                    <p className="text-sm text-slate-600">Refunds are handled on a case-by-case basis. Contact our support team to discuss refund requests.</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                    <Shield className="w-6 h-6" />
                  </span>
                  Privacy and Data Protection
                </h2>
                <p className="leading-relaxed mb-4">
                  Your privacy is important to us. Please review our Privacy
                  Policy, which also governs your use of the service, to
                  understand our practices.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">8</span>
                  Service Availability
                </h2>
                <p className="leading-relaxed mb-4">
                  We strive to maintain high service availability, but we do not
                  guarantee that our services will be uninterrupted or error-free.
                  We reserve the right to modify, suspend, or discontinue any part
                  of our services at any time.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">9</span>
                  Limitation of Liability
                </h2>
                <p className="leading-relaxed mb-4">
                  In no event shall yetti AI, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from your
                  use of the service.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">10</span>
                  Indemnification
                </h2>
                <p className="leading-relaxed mb-4">
                  You agree to defend, indemnify, and hold harmless yetti AI and
                  its licensee and licensors, and their employees, contractors,
                  agents, officers and directors, from and against any and all
                  claims, damages, obligations, losses, liabilities, costs or
                  debt, and expenses (including but not limited to attorney's
                  fees).
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">11</span>
                  Termination
                </h2>
                <p className="leading-relaxed mb-4">
                  We may terminate or suspend your account and bar access to the
                  service immediately, without prior notice or liability, under
                  our sole discretion, for any reason whatsoever and without
                  limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">12</span>
                  Governing Law
                </h2>
                <p className="leading-relaxed mb-4">
                  These Terms shall be interpreted and governed by the laws of the
                  State of California, without regard to its conflict of law
                  provisions. Our failure to enforce any right or provision of
                  these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">13</span>
                  Changes to Terms
                </h2>
                <p className="leading-relaxed mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days notice prior to any new terms
                  taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">14</span>
                  Contact Information
                </h2>
                <p className="leading-relaxed mb-6">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Email</p>
                      <p className="font-medium text-lg">legal@yettiai.com</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Address</p>
                      <p className="font-medium text-lg">123 AI Street, San Francisco, CA 94105</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Phone</p>
                      <p className="font-medium text-lg">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}