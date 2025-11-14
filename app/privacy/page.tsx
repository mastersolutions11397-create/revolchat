import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                Last updated: December 15, 2024
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_angry.png"
                  alt="yetti Privacy"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  yetti AI ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our AI
                  integration platform and services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. Information We Collect
                  </h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.1 Personal Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>
                    Name and contact information (email address, phone number)
                  </li>
                  <li>Account credentials and profile information</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences</li>
                  <li>Support and customer service interactions</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.2 Usage Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We automatically collect certain information about your use of
                  our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>
                    Device information (IP address, browser type, operating
                    system)
                  </li>
                  <li>Usage patterns and preferences</li>
                  <li>Log data and analytics information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.3 AI Agent Data
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you use our AI integration services, we may process:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Messages and conversations processed by your AI agents</li>
                  <li>Integration configurations and settings</li>
                  <li>Performance metrics and analytics data</li>
                  <li>Knowledge base content and training data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and fulfill your requests and transactions</li>
                  <li>Communicate with you about our services and updates</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Analyze usage patterns and optimize service performance</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>
                    With trusted service providers who assist in our operations
                  </li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Data Security
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction. These measures
                  include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
              </section>

              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Your Rights and Choices
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Access and obtain a copy of your personal information</li>
                  <li>Correct or update inaccurate information</li>
                  <li>Delete your personal information</li>
                  <li>Restrict or object to certain processing activities</li>
                  <li>Data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To exercise these rights, please contact us using the
                  information provided in the "Contact Us" section.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to
                  fulfill the purposes outlined in this Privacy Policy, unless a
                  longer retention period is required or permitted by law. When we
                  no longer need your information, we will securely delete or
                  anonymize it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure that such transfers
                  comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our services are not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If we become aware that we have collected
                  personal information from a child under 13, we will take steps
                  to delete such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date. We encourage you
                  to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data
                  practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> privacy@yettiai.com
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