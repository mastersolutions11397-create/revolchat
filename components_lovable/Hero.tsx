"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-sky-500/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(45,102,149,0.1),transparent)]"></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-[10%] w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-6 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          {/* Main Visual & Logo */}
          <div className="relative flex justify-center py-6">
             {/* Floating Cards - Left */}
             <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute left-1/2 -translate-x-[350px] top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-xl z-20"
            >
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <TrendingUp size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">Sales Growth</p>
                <p className="text-sm font-bold text-foreground">+124% this week</p>
              </div>
            </motion.div>

            {/* Floating Cards - Right */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute left-1/2 translate-x-[180px] top-10 hidden md:flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-xl z-20"
            >
              <div className="p-2 bg-blue-100 rounded-full text-sky-500">
                <MessageCircle size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">Active Chats</p>
                <p className="text-sm font-bold text-foreground">24/7 Response</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-b from-white to-sky-50 shadow-[0_0_60px_-15px_rgba(45,102,149,0.3)] flex items-center justify-center p-1 ring-1 ring-white/50">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/20 to-transparent opacity-50 blur-xl"></div>
                <img
                  src="/yetti/logo.png"
                  alt="Yetti.ai"
                  className="w-28 h-28 object-contain relative z-10 drop-shadow-lg"
                />
              </div>
            </motion.div>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl  lg:text-8xl font-bold tracking-tight leading-[1]"
          >
            <span className="text-foreground drop-shadow-sm">Never Miss Another </span>
            <span className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-500 bg-clip-text text-transparent pb-2">
              Customer Again
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Losing sales because you can't respond 24/7? Your <span className="text-foreground font-semibold">Yetti AI agent</span> works
            around the clock on social media selling products, scheduling
            meetings, and answering questions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-sky-500 hover:bg-sky-500/90 text-white shadow-[0_10px_40px_-10px_rgba(45,102,149,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(45,102,149,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-2 border-sky-500/10 hover:border-sky-500/20 hover:bg-sky-500/5 text-foreground transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2 text-sky-500" />
              See Demo
            </Button>
          </motion.div>
        
        </div>
      </div>
    </section>
  );
};

export default Hero;
