"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background with Gradient and Mesh */}
      <div className="absolute inset-0 bg-sky-500">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-sky-500/50 to-sky-500/90"></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-[100px] opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-300 rounded-full blur-[120px] opacity-30"
        />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 p-12 md:p-20 text-center shadow-2xl"
          >
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Start automating today</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black font-lato text-white tracking-tight leading-tight">
                Ready to Transform Your
                <span className="block mt-2 text-white">
                  Social Media Into Sales?
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-sky-50 max-w-3xl mx-auto leading-relaxed">
                Join businesses already using Yetti.ai to automate conversations,
                capture leads, and grow revenue 24/7.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg rounded-full bg-sky-500 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 text-lg rounded-full border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-semibold"
                >
                  View Pricing
                </Button>
              </div>
              
             
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
