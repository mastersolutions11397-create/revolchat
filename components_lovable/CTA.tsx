"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const CTA = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-6 relative overflow-hidden">
      {/* Background with Gradient and Mesh */}
      <div className="absolute inset-0 bg-teal-primary">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-teal-primary/50 to-teal-accent/90"></div>
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
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-accent rounded-full blur-[120px] opacity-30"
        />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden  p-12 md:p-20 text-center "
          >
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4" />
                <span>{t("cta.boostSales")}</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black font-lato text-white tracking-tight leading-tight">
                {t("cta.titleLine1")}
                <span className="block mt-1 text-white">
                  {t("cta.titleLine2")}
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {t("cta.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
                <Button
                  size="lg"
                  onClick={() => router.push("/auth/signup")}
                  className="h-16 px-10 text-lg rounded-full bg-white !text-gray-900 hover:!bg-white  cursor-pointer  shadow-xl  hover:-translate-y-1 transition-all duration-300 font-bold"
                >
                  {t("cta.startTrial")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToPricing}
                  className="h-16 px-10 text-lg rounded-full border-2 hover:!text-white border-white/30 bg-transparent text-white transition-all duration-300 font-semibold"
                >
                  {t("cta.viewPricing")}
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
