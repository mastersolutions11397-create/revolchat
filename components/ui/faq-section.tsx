"use client";

import { PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

function FAQ() {
  const { t } = useLanguage();
  
  return (
    <div className="w-full py-10 md:py-24 bg-slate-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-24">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="animate-fade-in-up">
              <Badge variant="outline" className="bg-sky-500/5 text-sky-500 border-gray-200 px-4 py-1 mb-4">{t("faq.badge")}</Badge>
              <h4 className="text-3xl md:text-5xl tracking-tighter font-extrabold text-slate-900 mb-6">
                {t("faq.title")}
              </h4>
              <p className="text-lg leading-relaxed tracking-tight text-slate-600 mb-8">
                {t("faq.subtitle")}
              </p>       
            </div>
          </div>
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
              {[
                {
                  question: t("faq.q1.question"),
                  answer: t("faq.q1.answer")
                },
                {
                  question: t("faq.q2.question"),
                  answer: t("faq.q2.answer")
                },
                {
                  question: t("faq.q3.question"),
                  answer: t("faq.q3.answer")
                },
                {
                  question: t("faq.q4.question"),
                  answer: t("faq.q4.answer")
                },
                {
                  question: t("faq.q5.question"),
                  answer: t("faq.q5.answer")
                },
                {
                  question: t("faq.q6.question"),
                  answer: t("faq.q6.answer")
                },
                {
                  question: t("faq.q7.question"),
                  answer: t("faq.q7.answer")
                },
                {
                  question: t("faq.q8.question"),
                  answer: t("faq.q8.answer")
                }
              ].map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={"item-" + index} 
                  className="bg-white border border-slate-200 rounded-xl px-6 shadow-sm data-[state=open]:border-gray-200 data-[state=open]:shadow-md transition-all duration-200"
                >
                  <AccordionTrigger className="text-slate-900 font-semibold hover:text-sky-500 hover:no-underline py-4 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FAQ };


