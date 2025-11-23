import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation darkBackground={true} />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-8 border border-white/20 shadow-xl">
                <Shield className="w-10 h-10 text-sky-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-sky-100/80 font-medium">
                Last updated: December 15, 2024
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto animate-fade-in-up delay-100">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_angry.png"
                  alt="yetti Privacy"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-slate-200">
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">1</span>
                  Introduction
                </h2>
                <p className="leading-relaxed">
                  yetti AI ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our AI
                  integration platform and services.
                </p>
                <p className="leading-relaxed">
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                    <FileText className="w-6 h-6" />
                  </span>
                  Information We Collect
                </h2>

                <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    2.1 Personal Information
                  </h3>
                  <p className="mb-4">
                    We may collect the following types of personal information:
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Account credentials and profile information</li>
                    <li>Payment and billing information</li>
                    <li>Communication preferences</li>
                    <li>Support and customer service interactions</li>
                  </ul>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    2.2 Usage Information
                  </h3>
                  <p className="mb-4">
                    We automatically collect certain information about your use of
                    our services:
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage patterns and preferences</li>
                    <li>Log data and analytics information</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>

                  <h3 className="text-xl font-bold mb-4 text-slate-900">
                    2.3 AI Agent Data
                  </h3>
                  <p className="mb-4">
                    When you use our AI integration services, we may process:
                  </p>
                  <ul className="space-y-2">
                    <li>Messages and conversations processed by your AI agents</li>
                    <li>Integration configurations and settings</li>
                    <li>Performance metrics and analytics data</li>
                    <li>Knowledge base content and training data</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">3</span>
                  How We Use Your Information
                </h2>
                <p className="leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Provide, maintain, and improve our services",
                    "Process and fulfill your requests and transactions",
                    "Communicate with you about our services and updates",
                    "Provide customer support and technical assistance",
                    "Analyze usage patterns and optimize service performance",
                    "Ensure security and prevent fraud",
                    "Comply with legal obligations"
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
                  Information Sharing and Disclosure
                </h2>
                <p className="leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in our operations</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                    <Lock className="w-6 h-6" />
                  </span>
                  Data Security
                </h2>
                <div className="bg-sky-50 rounded-2xl p-8 border border-sky-100">
                  <p className="leading-relaxed mb-4 text-slate-700">
                    We implement appropriate technical and organizational measures
                    to protect your personal information against unauthorized
                    access, alteration, disclosure, or destruction. These measures
                    include:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Encryption of data in transit and at rest",
                      "Regular security assessments and updates",
                      "Access controls and authentication mechanisms",
                      "Employee training on data protection practices",
                      "Incident response and breach notification procedures"
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
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                    <Eye className="w-6 h-6" />
                  </span>
                  Your Rights and Choices
                </h2>
                <p className="leading-relaxed mb-4">
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>Access and obtain a copy of your personal information</li>
                  <li>Correct or update inaccurate information</li>
                  <li>Delete your personal information</li>
                  <li>Restrict or object to certain processing activities</li>
                  <li>Data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900">
                  To exercise these rights, please contact us using the
                  information provided in the "Contact Us" section.
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">7</span>
                  Data Retention
                </h2>
                <p className="leading-relaxed">
                  We retain your personal information for as long as necessary to
                  fulfill the purposes outlined in this Privacy Policy, unless a
                  longer retention period is required or permitted by law. When we
                  no longer need your information, we will securely delete or
                  anonymize it.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">8</span>
                  International Data Transfers
                </h2>
                <p className="leading-relaxed">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure that such transfers
                  comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">9</span>
                  Children's Privacy
                </h2>
                <p className="leading-relaxed">
                  Our services are not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If we become aware that we have collected
                  personal information from a child under 13, we will take steps
                  to delete such information.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">10</span>
                  Changes to This Privacy Policy
                </h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date. We encourage you
                  to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">11</span>
                  Contact Us
                </h2>
                <p className="leading-relaxed mb-6">
                  If you have any questions about this Privacy Policy or our data
                  practices, please contact us:
                </p>
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Email</p>
                      <p className="font-medium text-lg">privacy@yettiai.com</p>
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