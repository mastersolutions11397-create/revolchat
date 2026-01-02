"use client";

import { Star } from 'lucide-react';
import { useLanguage } from "@/lib/contexts/LanguageContext";

export function Testimonials() {
  const { t } = useLanguage();
  
  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-black font-lato tracking-tight text-slate-900 mb-6">
            {t("testimonials.titleLine1")} <span className="text-sky-500">{t("testimonials.titleLine2")}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Jenkins",
              role: "Owner, Boutique Styles",
              content: "Yetti transformed how we handle DMs. We used to miss so many sales because we couldn't reply fast enough. Now, it's instant.",
              image: "SJ"
            },
            {
              name: "Mike Ross",
              role: "Marketing Director, TechFlow",
              content: "The automated lead collection is a game changer. We've seen a 40% increase in qualified leads since implementing Yetti.",
              image: "MR"
            },
            {
              name: "Jessica Chen",
              role: "Founder, Glow Beauty",
              content: "Setting up was incredibly easy. The AI understood our brand voice immediately. It feels just like one of our team members.",
              image: "JC"
            }
          ].map((testimonial, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                &quot;{testimonial.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
