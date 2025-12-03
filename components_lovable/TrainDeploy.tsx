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

const trainingMethods = [
  {
    icon: () => <Image src="/yetti/google-sheets.png" alt="Google Sheets" width={28} height={28} className="w-7 h-7" />,
    title: "Google Sheets",
    description:
      "Connect your Google Sheets directly. Yetti automatically syncs and learns from your spreadsheets, product catalogs, and data.",
  },
  {
    icon: () => <Image src="/yetti/pdf.png" alt="PDF Documents" width={28} height={28} className="w-7 h-7" />,
    title: "PDF Documents",
    description:
      "Upload PDF documents with your product information, FAQs, policies, and business knowledge. Yetti extracts and learns everything.",
  },
  {
    icon: () => <Image src="/yetti/text.png" alt="Direct Text" width={28} height={28} className="w-7 h-7" />,
    title: "Direct Text",
    description:
      "Simply paste or type your content. Add product details, brand voice guidelines, or any information you want Yetti to know.",
  },
];

const deploymentSteps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account with just your email.",
    subtext: "No credit card required",
  },
  {
    icon: Brain,
    title: "Train Yetti",
    description: "Upload your product info, FAQs, or business details.",
    subtext: "Learns in seconds",
  },
  {
    icon: Rocket,
    title: "Go Live",
    description: "Connect your social accounts and start selling.",
    subtext: "Immediate deployment",
  },
];

const TrainDeploy = () => {
  return (
    <section id="how-it-works" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Training Section */}
        <div className="max-w-6xl mx-auto mb-32">
          <div className="text-center mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
                Train Your Yetti in <span className="text-sky-500">Minutes</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                No coding required. No complex setup. Just share your knowledge and watch your AI agent come to life.
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
                  <Card className="h-full p-8 border bg-white border-gray-200/50 hover:border-sky-500/50 hover:shadow-lg transition-all duration-300 bg-secondary/20 group">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-sky-500 transition-colors">
                      {method.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {method.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deployment Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
                Get Started in <span className="text-sky-500">3 Easy Steps</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Launch your AI sales agent in less than 10 minutes.
              </p>
            </motion.div>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent -translate-y-1/2 z-0"></div>

            {/* Arrows between steps (Desktop) */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full z-0">
              <div className="absolute left-1/3 mr-1.5 -translate-x-1/2">
                <div className="w-8 h-8 -translate-2 rounded-full bg-sky-500 flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute left-2/3 -translate-x-1/2">
                <div className="w-8 h-8 translate-x-2 -translate-y-2 rounded-full bg-sky-500 flex items-center justify-center shadow-lg">
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
                    <div className="bg-background rounded-2xl p-8 text-center border border-gray-200/50 shadow-lg hover:shadow-xl hover:border-sky-500/30 transition-all duration-300 group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-background z-20">
                        {index + 1}
                      </div>
                      
                      <div className="pt-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                          <Icon className="w-8 h-8 text-sky-500 group-hover:text-white transition-colors" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                        
                        <div className="pt-4 flex items-center justify-center text-sm font-medium text-sky-500">
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
