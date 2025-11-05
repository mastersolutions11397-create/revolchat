import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Testimonials() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-4xl font-medium lg:text-5xl">Loved by Businesses Worldwide</h2>
                    <p>Thousands of businesses trust Yetti to handle their customer conversations 24/7. See what they're saying.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
                        <CardHeader>
                            <div className="text-2xl font-bold text-gray-900">YETTI<span className="text-gray-400">.AI</span></div>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">Yetti has completely transformed how we handle customer service. We went from missing 40% of DMs to responding to every customer in seconds. Sales have increased 35% since we deployed Yetti on Instagram and Messenger. The best part? It took us less than 30 minutes to set up.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
                                            alt="Sarah Chen"
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>SC</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-sm font-medium">Sarah Chen</cite>
                                        <span className="text-muted-foreground block text-sm">Founder, Bloom Boutique</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">We were losing sales because we couldn't respond to customer questions fast enough. Yetti handles everything automatically now. Cart recovery alone has paid for the subscription ten times over.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop"
                                            alt="Marcus Rodriguez"
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>MR</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Marcus Rodriguez</cite>
                                        <span className="text-muted-foreground block text-sm">CEO, TechGear Store</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>Setup was incredibly easy. I uploaded our product catalog, set up a few workflows in Sheets, and Yetti was handling customer conversations the same day. Game changer.</p>

                                <div className="grid items-center gap-3 grid-cols-[auto_1fr]">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop"
                                            alt="Emma Thompson"
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>ET</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Emma Thompson</cite>
                                        <span className="text-muted-foreground block text-sm">Operations Manager, StyleCo</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="card variant-mixed">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>Yetti understands our brand voice perfectly. Customers can't tell they're talking to an AI. Response quality is consistently excellent.</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop"
                                            alt="David Kim"
                                            height={400}
                                            width={400}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>DK</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">David Kim</p>
                                        <span className="text-muted-foreground block text-sm">Marketing Director, FreshMarket</span>
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


