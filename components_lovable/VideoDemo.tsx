"use client";

import { Play, Maximize2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const VideoDemo = () => {
  const { t } = useLanguage();
  useEffect(() => {
    // Load Storylane script
    const script = document.createElement("script");
    script.src = "https://js.storylane.io/js/v2/storylane.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.querySelector(
        'script[src="https://js.storylane.io/js/v2/storylane.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6 tracking-tight">
              {t("videoDemo.title").split("Action")[0]} <span className="text-teal-primary">{t("videoDemo.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("videoDemo.subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Video Container with Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-2xl overflow-hidden w-full">
            {/* Video Area */}
            <div className="relative bg-slate-900 overflow-hidden w-full">
              <div
                className="sl-embed w-full"
                style={{
                  position: "relative",
                  paddingBottom: "calc(53.44% + 25px)",
                  width: "100%",
                  height: 0,
                  transform: "scale(1)",
                }}
              >
                <iframe
                  loading="lazy"
                  className="sl-demo"
                  src="https://app.storylane.io/demo/3ocaczjihcxr?embed=inline"
                  name="sl-embed"
                  allow="fullscreen"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "1px solid rgba(63,95,172,0.35)",
                    boxShadow: "0px 0px 18px rgba(26, 19, 72, 0.15)",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Decorative Glow Behind */}
          <div className="absolute -inset-4 bg-teal-primary/20 blur-3xl -z-10 rounded-[3rem] opacity-40"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
