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

const solutions = [
  {
    icon: Bot,
    title: "Never Miss a Sale",
    problem: "Losing customers because you can't respond instantly?",
    solution:
      "Your Yetti responds 24/7, converting interested customers into sales even while you sleep.",
  },
  {
    icon: Upload,
    title: "Stop Repeating Yourself",
    problem: "Tired of answering the same questions over and over?",
    solution:
      "Train your Yetti once with PDFs, Google Sheets, or text—it handles repetitive conversations forever.",
  },
  {
    icon: ShoppingBag,
    title: "Automate Your Sales",
    problem: "Can't afford a full-time sales team?",
    solution:
      "Your Yetti sells products, processes inquiries, and closes deals automatically on social media.",
  },
  {
    icon: Calendar,
    title: "End Scheduling Chaos",
    problem: "Wasting hours coordinating meetings?",
    solution:
      "Yetti syncs with Google Calendar and books meetings instantly—no more back-and-forth emails.",
  },
  {
    icon: MessageCircle,
    title: "Instant Customer Support",
    problem: "Customers leaving because of slow response times?",
    solution:
      "Your Yetti provides instant, accurate answers to FAQs, keeping customers engaged and happy.",
  },
  {
    icon: FileText,
    title: "Expert Product Knowledge",
    problem: "Struggling to communicate product value?",
    solution:
      "Yetti explains features, benefits, and details perfectly, trained on your exact specifications.",
  },
];

const Solutions = () => {
  return (
    <section id="features" className="py-32 bg-secondary/30 relative">
       {/* Background Pattern */}
       <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>

      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-5xl mx-auto text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
              Solutions to Your <span className="text-sky-500">Biggest Challenges</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop losing customers to slow responses. Your Yetti solves the problems keeping you up at night.
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
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
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
