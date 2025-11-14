import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { FileText, Scale, Shield, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Terms of Service
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                Last updated: December 15, 2024
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_sheets.png"
                  alt="yetti Terms"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Acceptance of Terms
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using yetti AI's services, you accept and agree
                  to be bound by the terms and provision of this agreement. If you
                  do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Description of Service
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  yetti AI provides an AI integration platform that allows users to
                  connect their AI agents to various social media and messaging
                  platforms including but not limited to Instagram, Telegram,
                  WhatsApp, and other third-party services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our service includes tools for creating, managing, and deploying
                  AI agents, as well as analytics and monitoring capabilities.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. User Accounts
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3.1 Account Creation
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use our services, you must create an account. You agree to
                  provide accurate, current, and complete information during the
                  registration process and to update such information to keep it
                  accurate, current, and complete.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3.2 Account Security
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are responsible for maintaining the confidentiality of your
                  account credentials and for all activities that occur under your
                  account. You agree to notify us immediately of any unauthorized
                  use of your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Acceptable Use
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.1 Permitted Uses
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may use our services only for lawful purposes and in
                  accordance with these Terms. You agree not to use our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>
                    In any way that violates any applicable federal, state, local,
                    or international law or regulation
                  </li>
                  <li>
                    To transmit, or procure the sending of, any advertising or
                    promotional material without our prior written consent
                  </li>
                  <li>
                    To impersonate or attempt to impersonate the Company, a
                    Company employee, another user, or any other person or entity
                  </li>
                  <li>
                    To engage in any other conduct that restricts or inhibits
                    anyone's use or enjoyment of the service
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.2 Prohibited Activities
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>
                    Use our services to create, distribute, or facilitate spam,
                    malware, or other harmful content
                  </li>
                  <li>
                    Attempt to gain unauthorized access to any portion of our
                    services or any other systems or networks
                  </li>
                  <li>
                    Use automated means to access our services for any purpose
                    without our express written permission
                  </li>
                  <li>
                    Interfere with or disrupt our services or servers or networks
                    connected to our services
                  </li>
                  <li>
                    Use our services to violate the terms of service of any
                    third-party platform
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Intellectual Property Rights
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.1 Our Rights
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The service and its original content, features, and
                  functionality are and will remain the exclusive property of yetti
                  AI and its licensors. The service is protected by copyright,
                  trademark, and other laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.2 Your Content
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You retain ownership of any content you create, upload, or share
                  through our services. By using our services, you grant us a
                  limited, non-exclusive, royalty-free license to use, modify, and
                  distribute your content solely for the purpose of providing our
                  services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Payment Terms
                </h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  6.1 Subscription Fees
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Some features of our service are provided for a fee. You agree
                  to pay all applicable fees as described in the service at the
                  time you choose to purchase or subscribe to such features.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  6.2 Billing and Renewal
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Subscription fees are billed in advance on a monthly or annual
                  basis. Your subscription will automatically renew unless you
                  cancel it before the end of the current billing period.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  6.3 Refunds
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Refunds are handled on a case-by-case basis. Contact our support
                  team to discuss refund requests.
                </p>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    7. Privacy and Data Protection
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your privacy is important to us. Please review our Privacy
                  Policy, which also governs your use of the service, to
                  understand our practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Service Availability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We strive to maintain high service availability, but we do not
                  guarantee that our services will be uninterrupted or error-free.
                  We reserve the right to modify, suspend, or discontinue any part
                  of our services at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In no event shall yetti AI, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from your
                  use of the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to defend, indemnify, and hold harmless yetti AI and
                  its licensee and licensors, and their employees, contractors,
                  agents, officers and directors, from and against any and all
                  claims, damages, obligations, losses, liabilities, costs or
                  debt, and expenses (including but not limited to attorney's
                  fees).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may terminate or suspend your account and bar access to the
                  service immediately, without prior notice or liability, under
                  our sole discretion, for any reason whatsoever and without
                  limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be interpreted and governed by the laws of the
                  State of California, without regard to its conflict of law
                  provisions. Our failure to enforce any right or provision of
                  these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  13. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days notice prior to any new terms
                  taking effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  14. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> legal@yettiai.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Address:</strong> 123 AI Street, San Francisco, CA
                    94105
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}