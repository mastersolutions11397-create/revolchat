"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function Testimonials() {
    const { t } = useLanguage();
    
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center ">
                    <h2 className="text-4xl font-semibold lg:text-5xl">{t("testimonials.title")}</h2>
                    <p>{t("testimonials.subtitle")}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
                        <CardHeader>
                            <div className="text-2xl font-bold text-gray-900">YETTI<span className="text-gray-400">.AI</span></div>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">{t("testimonials.testimonial1.text")}</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
                                            alt={t("testimonials.testimonial1.name")}
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>SC</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-sm font-medium">{t("testimonials.testimonial1.name")}</cite>
                                        <span className="text-muted-foreground block text-sm">{t("testimonials.testimonial1.role")}</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">{t("testimonials.testimonial2.text")}</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop"
                                            alt={t("testimonials.testimonial2.name")}
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>MR</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">{t("testimonials.testimonial2.name")}</cite>
                                        <span className="text-muted-foreground block text-sm">{t("testimonials.testimonial2.role")}</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">{t("testimonials.testimonial3.text")}</p>

                                <div className="grid items-center gap-3 grid-cols-[auto_1fr]">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop"
                                            alt={t("testimonials.testimonial3.name")}
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>ET</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">{t("testimonials.testimonial3.name")}</cite>
                                        <span className="text-muted-foreground block text-sm">{t("testimonials.testimonial3.role")}</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="card variant-mixed">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">{t("testimonials.testimonial4.text")}</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop"
                                            alt={t("testimonials.testimonial4.name")}
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>DK</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{t("testimonials.testimonial4.name")}</p>
                                        <span className="text-muted-foreground block text-sm">{t("testimonials.testimonial4.role")}</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}


