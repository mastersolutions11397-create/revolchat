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
  Heart,
  Globe,
  Zap
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation darkBackground={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">yetti AI</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-fade-in-up delay-200">
              We&apos;re revolutionizing how businesses connect their AI agents to the
              world&apos;s most popular platforms, making advanced AI accessible to
              everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative -mt-20 z-20 pt-42">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-slate-200 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              <div className="relative w-full aspect-square max-w-md mx-auto order-2 lg:order-1">
                <Image
                  src="/yetti/yetti_sitting.png"
                  alt="yetti Mission"
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left order-1 lg:order-2">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 text-sky-500">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  To democratize AI technology by providing businesses of all sizes
                  with powerful, easy-to-use tools that connect their AI agents to
                  Instagram, Telegram, and other major platforms.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We believe that every business should have access to cutting-edge AI capabilities
                  without the complexity of building everything from scratch.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide our work and shape our culture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Rocket,
                title: "Innovation",
                desc: "We continuously push the boundaries of what's possible with AI integration, staying ahead of the curve."
              },
              {
                icon: Globe,
                title: "Accessibility",
                desc: "We make advanced AI technology accessible to businesses of all sizes, removing technical barriers."
              },
              {
                icon: Shield,
                title: "Security",
                desc: "Your data and your customers' data are our top priority. We implement enterprise-grade security."
              },
              {
                icon: Heart,
                title: "Customer First",
                desc: "We build with empathy, always putting our customers' needs at the center of every decision."
              },
              {
                icon: Zap,
                title: "Simplicity",
                desc: "We believe powerful technology should be simple to use. We obsess over clean, intuitive design."
              },
              {
                icon: Users,
                title: "Community",
                desc: "We foster a community of creators and developers, sharing knowledge and growing together."
              }
            ].map((value, i) => (
              <div key={i} className="group rounded-2xl bg-white p-8 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center  mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                  <value.icon className="w-7 h-7 text-sky-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="rounded-3xl bg-slate-900 text-white p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-6">Meet the Team</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  We&apos;re a passionate team of AI researchers, engineers, and
                  designers working together to build the future of AI integration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/25">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    AI Engineers
                  </h3>
                  <p className="text-slate-300">
                    Building the core AI infrastructure that powers our platform
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Integration Specialists
                  </h3>
                  <p className="text-slate-300">
                    Creating seamless connections to your favorite platforms
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    UX Designers
                  </h3>
                  <p className="text-slate-300">
                    Crafting intuitive experiences that make AI accessible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}