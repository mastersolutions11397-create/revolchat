import { Check, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function FAQ() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">FAQ</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                  Frequently Asked Questions
                </h4>
                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground  text-left">
                  Everything you need to know about Yetti. Can't find your answer? Reach out to our team.
                </p>
              </div>
              <div className="">
                <Link href="/contact">
                  <Button className="gap-4" variant="outline">
                    Still have questions? <PhoneCall className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: "How does Yetti work?",
                answer: "Yetti learns from your content (PDFs, text files, or Google Sheets) to understand your products and brand voice. You can build conversation workflows in Google Sheets without coding. Once trained, Yetti automatically responds to customers on Instagram, Messenger, and Telegram 24/7."
              },
              {
                question: "How long does setup take?",
                answer: "Most businesses get Yetti up and running in under 30 minutes. Upload your content, configure your workflows in Sheets, and connect your social media accounts. No coding or technical expertise required."
              },
              {
                question: "What platforms does Yetti support?",
                answer: "Yetti currently supports Instagram (DMs and comments), Facebook Messenger, and Telegram. We're constantly adding new platforms based on customer demand."
              },
              {
                question: "Can Yetti handle complex customer questions?",
                answer: "Yes! Yetti can answer questions based on your training content and follow custom workflows you design in Google Sheets. For complex issues beyond its knowledge, Yetti can seamlessly hand off the conversation to your human team."
              },
              {
                question: "How accurate are Yetti's responses?",
                answer: "Yetti uses built-in guardrails to ensure responses stay accurate and on-brand. It only answers based on your training content and won't make up information. You can review and refine responses over time."
              },
              {
                question: "Do I need coding skills to use Yetti?",
                answer: "No coding required! Everything is done through our web interface and Google Sheets. You can train Yetti, build workflows, and manage conversations all without writing a single line of code."
              },
              {
                question: "Can I integrate Yetti with my existing tools?",
                answer: "Yes, Yetti integrates with popular ecommerce platforms, CRMs, inventory systems, and custom APIs. It becomes the central hub for all your customer interactions."
              },
              {
                question: "What happens if Yetti doesn't know the answer?",
                answer: "Yetti is designed to gracefully handle unknowns. It can either route the conversation to your human team, collect customer information for follow-up, or provide helpful context based on what it does know. You control the fallback behavior."
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


