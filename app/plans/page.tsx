import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Check } from "lucide-react";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Choose Your Perfect Plan
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                Start free and scale as you grow. All plans include our core AI
                agent integration features.
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetting_holding_dollar_sign.png"
                  alt="Yeti Plans"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">1 AI Agent</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">2 Platform Integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">1,000 Messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Basic Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Email Support</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-all text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-[#5170ff] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#5170ff] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For growing businesses</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">5 AI Agents</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited Integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">50,000 Messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Priority Support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Custom Branding</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">API Access</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-[#5170ff] hover:bg-[#4a68f0] text-white py-3 px-4 rounded-xl font-semibold transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)] text-center block"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Enterprise
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For large organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited AI Agents</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited Integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited Messages</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced Analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">24/7 Phone Support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Custom Branding</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Full API Access</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    Dedicated Account Manager
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Custom Integrations</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-all text-center block"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 mb-12">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <Image
                src="/yetti/yetti_trolly.png"
                alt="Yeti Features"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compare All Features
              </h2>
              <p className="text-xl text-gray-600">
                See what's included in each plan
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Pro
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    AI Agents
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">5</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Platform Integrations
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">2</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Messages per Month
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">1,000</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    50,000
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Analytics
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Advanced
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Advanced
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Support
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">Email</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Priority
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    24/7 Phone
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    API Access
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">-</td>
                  <td className="py-4 px-6 text-center text-gray-600">✓</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Full Access
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl bg-white p-12 shadow-lg border border-gray-200">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses already using Yeti AI to automate
              their customer interactions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-xl text-white bg-[#5170ff] hover:bg-[#4a68f0] transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)] text-lg font-semibold"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-lg font-semibold"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}