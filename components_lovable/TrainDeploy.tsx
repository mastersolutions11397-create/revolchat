"use client";

import {
  UserPlus,
  Brain,
  Rocket,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const TrainDeploy = () => {
  const { t } = useLanguage();

  const trainingMethods = [
    {
      icon: () => (
        <Image
          src="/yetti/google-sheets.png"
          alt="Google Sheets"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      ),
      title: t("trainDeploy.method1.title"),
      description: t("trainDeploy.method1.desc"),
    },
    {
      icon: () => (
        <Image
          src="/yetti/pdf.png"
          alt="PDF Documents"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      ),
      title: t("trainDeploy.method2.title"),
      description: t("trainDeploy.method2.desc"),
    },
    {
      icon: () => (
        <Image
          src="/yetti/text.png"
          alt="Direct Text"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      ),
      title: t("trainDeploy.method3.title"),
      description: t("trainDeploy.method3.desc"),
    },
  ];

  const deploymentSteps = [
    {
      icon: UserPlus,
      title: t("trainDeploy.step1.title"),
      description: t("trainDeploy.step1.desc"),
      subtext: t("trainDeploy.step1.subtext"),
    },
    {
      icon: Brain,
      title: t("trainDeploy.step2.title"),
      description: t("trainDeploy.step2.desc"),
      subtext: t("trainDeploy.step2.subtext"),
    },
    {
      icon: Rocket,
      title: t("trainDeploy.step3.title"),
      description: t("trainDeploy.step3.desc"),
      subtext: t("trainDeploy.step3.subtext"),
    },
  ];
  return (
    <section
      id="how-it-works"
      className="py-10 md:py-20 lg:py-32 bg-dashboard-bg relative overflow-hidden"
    >
      <div className="container px-4 mx-auto relative z-10">
        {/* Training Section */}
        <div className="max-w-6xl mx-auto mb-20 md:mb-32">
          <div className="text-center mb-10 md:mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
                {t("trainDeploy.trainTitle").split("Minutes")[0]}{" "}
                <span className="text-teal-primary">{t("trainDeploy.trainTitleHighlight")}</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("trainDeploy.trainSubtitle")}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainingMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 border bg-white border-gray-200/50 hover:border-teal-primary/50 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex gap-4 items-start">
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-teal-primary transition-colors">
                          {method.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deployment Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
                {t("trainDeploy.deployTitle").split("3 Easy Steps")[0]}{" "}
                <span className="text-teal-primary">{t("trainDeploy.deployTitleHighlight")}</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("trainDeploy.deploySubtitle")}
              </p>
            </motion.div>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-teal-primary/30 to-transparent -translate-y-1/2 z-0"></div>

            {/* Arrows between steps (Desktop) */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full z-0">
              <div className="absolute left-1/3 mr-1.5 -translate-x-1/2">
                <div className="w-8 h-8 -translate-x-2 -translate-y-4 rounded-full bg-teal-primary flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute left-2/3 -translate-x-1/2">
                <div className="w-8 h-8 translate-x-2 -translate-y-4 rounded-full bg-teal-primary flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {deploymentSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="bg-background rounded-2xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-xl hover:border-teal-primary/30 transition-all duration-300 group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-teal-primary text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-background z-20">
                        {index + 1}
                      </div>

                      <div className="pt-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-teal-primary/10 flex items-center justify-center group-hover:bg-teal-primary group-hover:text-white transition-all duration-300">
                          <Icon className="w-8 h-8 text-teal-primary group-hover:text-white transition-colors" />
                        </div>

                        <h3 className="text-2xl font-bold text-foreground">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground">
                          {step.description}
                        </p>

                        <div className="pt-4 flex items-center justify-center text-sm font-medium text-teal-primary">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          {step.subtext}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainDeploy;
