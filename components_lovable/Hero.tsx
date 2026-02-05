"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const Hero = () => {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-teal-primary/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(15,118,110,0.1),transparent)]"></div>
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
          className="absolute top-1/4 left-[10%] w-64 h-64 bg-teal-primary/10 rounded-full blur-3xl"
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
          <div className="relative flex justify-center py-4 sm:py-6">
            {/* Floating Cards - Left */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute left-1/2 -translate-x-[350px] top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-xl z-20"
            >
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <TrendingUp size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">
                  {t("hero.salesGrowth")}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {t("hero.salesGrowthValue")}
                </p>
              </div>
            </motion.div>

            {/* Floating Cards - Right */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute left-1/2 translate-x-[180px] top-10 hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-xl z-20"
            >
              <div className="p-2 bg-teal-primary/10 rounded-full text-teal-primary">
                <MessageCircle size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">
                  {t("hero.activeChats")}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {t("hero.alwaysOn")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-b from-white to-teal-primary/10 shadow-[0_0_60px_-15px_rgba(15,118,110,0.3)] flex items-center justify-center p-1 ring-1 ring-white/50">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-primary/20 to-transparent opacity-50 blur-xl"></div>
                <img
                  src="/yetti/logo.png"
                  alt="Yetti.ai"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10 drop-shadow-lg"
                />
              </div>
            </motion.div>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] sm:leading-[1] px-2"
          >
            <span className="text-foreground drop-shadow-sm">
              {t("hero.titleLine1")}{" "}
            </span>
            <span className="bg-gradient-to-r from-teal-primary to-teal-accent bg-clip-text text-transparent pb-2">
              {t("hero.titleLine2")}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-4 sm:pt-6 px-4"
          >
            <Button
              size="lg"
              onClick={() => router.push("/auth/login")}
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full bg-teal-primary hover:bg-teal-accent text-white shadow-[0_10px_40px_-10px_rgba(15,118,110,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              {t("hero.launchNow")}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
