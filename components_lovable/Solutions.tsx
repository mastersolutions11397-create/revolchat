"use client";

import {
  Bot,
  Upload,
  ShoppingBag,
  Calendar,
  MessageCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const Solutions = () => {
  const { t } = useLanguage();

  const solutions = [
    {
      icon: Bot,
      title: t("solutions.solution1.title"),
      problem: t("solutions.solution1.problem"),
      solution: t("solutions.solution1.solution"),
    },
    {
      icon: Upload,
      title: t("solutions.solution2.title"),
      problem: t("solutions.solution2.problem"),
      solution: t("solutions.solution2.solution"),
    },
    {
      icon: ShoppingBag,
      title: t("solutions.solution3.title"),
      problem: t("solutions.solution3.problem"),
      solution: t("solutions.solution3.solution"),
    },
    {
      icon: Calendar,
      title: t("solutions.solution4.title"),
      problem: t("solutions.solution4.problem"),
      solution: t("solutions.solution4.solution"),
    },
    {
      icon: MessageCircle,
      title: t("solutions.solution5.title"),
      problem: t("solutions.solution5.problem"),
      solution: t("solutions.solution5.solution"),
    },
    {
      icon: FileText,
      title: t("solutions.solution6.title"),
      problem: t("solutions.solution6.problem"),
      solution: t("solutions.solution6.solution"),
    },
  ];
  return (
    <section id="features" className="py-10 md:py-20 lg:py-32 bg-secondary/30 relative">
       {/* Background Pattern */}
       <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>

      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-5xl mx-auto text-center mb-10 md:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
              {t("solutions.title").split("Biggest Challenges")[0]} <span className="text-sky-500">{t("solutions.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("solutions.subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative p-8 h-full bg-background border border-gray-200/50 hover:border-sky-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 space-y-6">
                    {/* Icon and Title in same row */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                        <Icon className="w-7 h-7 text-sky-500 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-sky-500 transition-colors">
                        {solution.title}
                      </h3>
                    </div>

                    {/* Content */}
                    <div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground/80 italic border-l-2 border-sky-500/20 pl-3">
                          &quot;{solution.problem}&quot;
                        </p>
                        <p className="text-foreground leading-relaxed">
                          {solution.solution}
                        </p>
                      </div>
                    </div>
                    
                    {/* Learn More Link */}
                    <div className="pt-2 flex items-center text-sky-500 font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {t("solutions.learnMore")} <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
