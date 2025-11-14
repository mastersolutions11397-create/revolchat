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
    <div className="w-full py-8 lg:py-20 px-5">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">{t("faq.badge")}</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                  {t("faq.title")}
                </h4>
                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground  text-left">
                  {t("faq.subtitle")}
                </p>
              </div>
              <div className="">
                <Link href="/contact">
                  <Button className="gap-4" variant="outline">
                    {t("faq.contactButton")} <PhoneCall className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
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
              <AccordionItem key={index} value={"item-" + index}>
                <AccordionTrigger>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export { FAQ };


