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
                About yetti AI
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                We&apos;re revolutionizing how businesses connect their AI agents to the
                world&apos;s most popular platforms, making advanced AI accessible to
                everyone.
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_posing_for_a_pic.png"
                  alt="yetti AI"
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
                  alt="yetti Mission"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left">
                <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
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
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We continuously push the boundaries of what&apos;s possible with AI
                integration, staying ahead of the curve in technology and user
                experience.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
              <p className="text-gray-600">
                Your data and your customers&apos; data are our top priority. We
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
                We&apos;re a passionate team of AI researchers, engineers, and
                designers working together to build the future of AI integration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  AI Engineers
                </h3>
                <p className="text-gray-600">
                  Building the core AI infrastructure that powers our platform
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Integration Specialists
                </h3>
                <p className="text-gray-600">
                  Creating seamless connections to your favorite platforms
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white" />
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
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}