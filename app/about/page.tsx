import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import {
  Target,
  Rocket,
  Users,
  Shield,
  Code,
  Palette,
  Settings,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                About Yeti AI
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                We're revolutionizing how businesses connect their AI agents to the
                world's most popular platforms, making advanced AI accessible to
                everyone.
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_posing_for_a_pic.png"
                  alt="Yeti AI"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/yetti/yetti_sitting.png"
                  alt="Yeti Mission"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left">
                <div className="w-20 h-20 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To democratize AI technology by providing businesses of all sizes
                  with powerful, easy-to-use tools that connect their AI agents to
                  Instagram, Telegram, and other major platforms. We believe that
                  every business should have access to cutting-edge AI capabilities
                  without the complexity of building everything from scratch.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We continuously push the boundaries of what's possible with AI
                integration, staying ahead of the curve in technology and user
                experience.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Accessibility
              </h3>
              <p className="text-gray-600">
                We make advanced AI technology accessible to businesses of all
                sizes, removing technical barriers and complexity.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
              <p className="text-gray-600">
                Your data and your customers' data are our top priority. We
                implement enterprise-grade security measures to protect what
                matters most.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're a passionate team of AI researchers, engineers, and
                designers working together to build the future of AI integration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  AI Engineers
                </h3>
                <p className="text-gray-600">
                  Building the core AI infrastructure that powers our platform
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Integration Specialists
                </h3>
                <p className="text-gray-600">
                  Creating seamless connections to your favorite platforms
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-[#5170ff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  UX Designers
                </h3>
                <p className="text-gray-600">
                  Crafting intuitive experiences that make AI accessible
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 mb-12">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/yetti/yetti_laptop.png"
                  alt="Yeti Stats"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  By the Numbers
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Our impact in the AI integration space
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#5170ff] mb-2">
                  10K+
                </div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#5170ff] mb-2">50M+</div>
                <div className="text-gray-600">Messages Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#5170ff] mb-2">
                  99.9%
                </div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#5170ff] mb-2">
                  24/7
                </div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Yeti AI to connect their
              AI agents to the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-xl text-white bg-[#5170ff] hover:bg-[#4a68f0] transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)] font-semibold"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-semibold"
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