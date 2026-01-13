"use client";

import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";
import Navbar from "../../components_lovable/Navbar";
import Footer from "../../components_lovable/Footer";

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-sky-100/80 font-medium">
                Effective Date: March 1st
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
              
              {/* Section 1: Introduction */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">1</span>
                  Introduction
                </h2>
                <p className="leading-relaxed">
                  Welcome to yetti.ai ("we," "our," or "us"). We are committed to providing AI-powered solutions that enhance user experiences while ensuring privacy and security. Our services aim to deliver efficiency, automation, and seamless AI interactions with transparency. This Privacy Policy outlines how we collect, use, share, and protect your data when you visit our website or use our services.
                </p>
              </section>

              {/* Section 2: What We Do */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">2</span>
                  What We Do
                </h2>
                <p className="leading-relaxed">
                  Our platform offers AI-powered tools for content generation, automation, analytics, scheduling, and agent-based responses using integrated data sources. Users can access features based on their plan, with flexible credit usage and upgrade options.
                </p>
              </section>

              {/* Section 3: Information We Collect */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">3</span>
                  Information We Collect
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Account Information:</strong> Email, username, and preferences for personalized experiences.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Usage Data:</strong> AI task usage to maintain fairness and improve performance.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Payment & Transactions:</strong> Handled securely via trusted payment gateways.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Technical Data:</strong> IP address, browser type, OS, and platform interaction data.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Google Sheets & Drive Data:</strong> With user consent, we access specific spreadsheets and drive files you authorize. This includes reading data from your spreadsheets to enable automated replies and agent services. We only access files explicitly granted via Google's OAuth scopes and do not modify or delete data unless necessary to provide the requested service. For Google Drive, we use the access to view files created by our own application only, ensuring minimal and scoped access aligned with Google's policies.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2.5 shrink-0"></span>
                    <span><strong>Security & Compliance:</strong> Strict protocols for legal compliance and user safety.</span>
                  </li>
                </ul>
              </section>

              {/* Section 4: How We Use Your Data */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">4</span>
                  How We Use Your Data
                </h2>
                <ul className="space-y-2">
                  <li>Ensure platform functionality and improve overall user experience.</li>
                  <li>Customize experiences based on preferences and behavior.</li>
                  <li>Protect accounts from unauthorized access and ensure regulatory compliance.</li>
                  <li>Read data from user-authorized Google Sheets and Drive files to deliver agent responses and automation services.</li>
                  <li>Send updates, newsletters, and promotions with user consent.</li>
                  <li>Analyze behavior for product and performance improvements.</li>
                </ul>
              </section>

              {/* Section 5: Sharing of Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">5</span>
                  Sharing of Information
                </h2>
                <ul className="space-y-2">
                  <li><strong>Service Providers:</strong> Third-party vendors aiding operations, payments, support, and Google integration functionalities.</li>
                  <li><strong>Advertising Partners:</strong> Including Meta Platforms for targeted ads (with consent).</li>
                  <li><strong>Legal Requirements:</strong> When legally obligated or for security reasons.</li>
                </ul>
              </section>

              {/* Section 6: User Rights & Control */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <Eye className="w-6 h-6" />
                  </span>
                  User Rights & Control
                </h2>
                <ul className="space-y-2 mb-6">
                  <li><strong>Access & Update:</strong> Modify your personal data anytime.</li>
                  <li><strong>Usage Management:</strong> Adjust preferences and settings as needed.</li>
                  <li><strong>Google Integration Revocation:</strong> You can revoke our access to your Google Sheets and Drive files anytime via your Google Account permissions (<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">https://myaccount.google.com/permissions</a>).</li>
                  <li><strong>Account Deletion:</strong> Request full removal of data and account by contacting us.</li>
                </ul>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900">
                  To exercise these rights, contact us at: <a href="mailto:info@yetti.ai" className="font-semibold underline">info@yetti.ai</a>
                </div>
              </section>

              {/* Section 7: Cookies and Tracking Technologies */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">7</span>
                  Cookies and Tracking Technologies
                </h2>
                <p className="leading-relaxed">
                  We use cookies and similar tools to enhance user experiences, analyze platform usage, and serve targeted ads. Users can manage cookie settings through browser preferences.
                </p>
              </section>

              {/* Section 8: Security Measures */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <Lock className="w-6 h-6" />
                  </span>
                  Security Measures
                </h2>
                <p className="leading-relaxed">
                  We implement strong technical and organizational measures to safeguard your personal data, including Google Sheets and Drive data, from unauthorized access, misuse, and alteration.
                </p>
              </section>

              {/* Section 9: Third-Party Links */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">9</span>
                  Third-Party Links
                </h2>
                <p className="leading-relaxed">
                  Our website may include links to third-party sites. We are not responsible for their privacy practices and recommend reviewing their policies.
                </p>
              </section>

              {/* Section 10: Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">10</span>
                  Children's Privacy
                </h2>
                <p className="leading-relaxed">
                  Our services are not intended for users under the age of 13. We do not knowingly collect data from children.
                </p>
              </section>

              {/* Section 11: Changes & Updates */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">11</span>
                  Changes & Updates
                </h2>
                <p className="leading-relaxed">
                  We may revise this Privacy Policy as needed to reflect improvements or regulatory changes. Significant changes will be communicated transparently.
                </p>
              </section>

              {/* Section 12: Contact Us */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">12</span>
                  Contact Us
                </h2>
                <p className="leading-relaxed mb-6">
                  For questions or concerns regarding this Privacy Policy, reach out to us at:
                </p>
                <div className="bg-sky-500 text-white p-8 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6" />
                    <a href="mailto:info@yetti.ai" className="font-medium text-lg hover:underline">info@yetti.ai</a>
                  </div>
                </div>
              </section>

              {/* Section 13: Instagram Login Data */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">13</span>
                  Instagram Login Data
                </h2>
                <p className="leading-relaxed">
                  If you choose to log in using your Instagram account, we collect basic profile information provided by Instagram, such as your Instagram ID and username. This information is used solely for authentication and personalization purposes. We do not post on your behalf or access your private Instagram data. You can revoke access at any time by logging out from our app.
                </p>
              </section>

              {/* Section 13.1: Instagram Agent Integration */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-900 text-lg">13.1</span>
                  Instagram Agent Integration
                </h2>
                <p className="leading-relaxed">
                  When users authorize our service through Instagram, we may access message data to enable automated responses via our chatbot. This feature allows the chatbot to reply to incoming messages on your behalf based on your settings and preferences. We do not store message content beyond what is necessary to deliver the service, and no messages are sent without your consent. You can disable this feature at any time by logging out from our app.
                </p>
              </section>

              {/* Section 14: Google Sheets and Drive Integration */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-500">
                    <FileText className="w-6 h-6" />
                  </span>
                  Google Sheets and Drive Integration
                </h2>
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">Data Access</h3>
                  <p className="mb-4">
                    We request the <code className="bg-slate-200 px-2 py-1 rounded">https://www.googleapis.com/auth/spreadsheets</code> and <code className="bg-slate-200 px-2 py-1 rounded">https://www.googleapis.com/auth/drive</code> scopes to read spreadsheet data and access user-authorized files required for our services.
                  </p>

                  <h3 className="text-xl font-bold mb-4 text-slate-900 mt-6">Purpose</h3>
                  <p className="mb-4">
                    Your spreadsheet data is read to enable our agents to respond to queries, process inventory data, and deliver the requested functionality seamlessly.
                  </p>

                  <h3 className="text-xl font-bold mb-4 text-slate-900 mt-6">Limitations</h3>
                  <p className="mb-4">
                    We only access files and data explicitly granted by you through Google's OAuth process. For Google Drive, we use the access to view files created by our own application only, ensuring minimal and scoped access aligned with Google's policies.
                  </p>

                  <h3 className="text-xl font-bold mb-4 text-slate-900 mt-6">Revocation</h3>
                  <p className="mb-4">
                    You may revoke our access at any time via your Google Account permissions (<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">https://myaccount.google.com/permissions</a>), which will disable features relying on Google Sheets or Drive integration.
                  </p>
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