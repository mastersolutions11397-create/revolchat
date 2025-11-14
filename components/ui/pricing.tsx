"use client";

import { Button } from '@/components/ui/button'
import { Check, Github, Cpu, Columns3, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function Pricing() {
    const { t } = useLanguage();
    
    return (
        <div className="bg-[#0b1220] relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-stone-100 text-3xl font-bold md:text-4xl lg:text-5xl">{t("pricing.title")}</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance text-lg">{t("pricing.subtitle")}</p>
                </div>
                <div className="mt-8 md:mt-16">
                    <Card className="relative">
                        <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="pb-12 text-center md:pb-0 md:pr-12">
                                <h3 className="text-2xl font-semibold">{t("pricing.plan.name")}</h3>
                                <p className="mt-2 text-lg">{t("pricing.plan.description")}</p>
                                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                                    <span className="text-4xl">$</span>234
                                </span>

                                <div className="flex justify-center">
                                    <Button
                                        asChild
                                        className=''
                                        size="lg">
                                        <Link href="#">{t("pricing.plan.button")}</Link>
                                    </Button>
                                </div>

                                <p className="text-muted-foreground mt-12 text-sm">{t("pricing.plan.includes")}</p>
                            </div>
                            <div className="relative">
                                <ul
                                    role="list"
                                    className="space-y-4">
                                    {[
                                        t("pricing.features.feature1"),
                                        t("pricing.features.feature2"),
                                        t("pricing.features.feature3"),
                                        t("pricing.features.feature4")
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check
                                                className="text-primary size-3"
                                                strokeWidth={3.5}
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-muted-foreground mt-6 text-sm">{t("pricing.companiesText")}</p>
                                <div className="mt-12 flex flex-wrap items-center justify-between gap-6 text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5" aria-hidden />
                                        <span className="text-sm">Nvidia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Columns3 className="h-5 w-5" aria-hidden />
                                        <span className="text-sm">Column</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Github className="h-5 w-5" aria-hidden />
                                        <span className="text-sm">GitHub</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5" aria-hidden />
                                        <span className="text-sm">Nike</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}


