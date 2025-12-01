
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Check, ShieldCheck, Smartphone, Briefcase, Gem, Star, Users, Building, Crown, Rocket, LifeBuoy, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const whatsappNumber = "+972533039834";
const getWhatsappUrl = (planName: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I'm interested in the ${planName} plan.`)}`;
const supportRoomId = "zQ54oMpZFS7gEUhG0f8I";

const calculateAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.75);
}

const roomPlans = {
  monthly: [
    { name: 'Trial', visitors: 10, price: 5 },
    { name: 'Starter', visitors: 25, price: 10 },
    { name: 'Community', visitors: 100, price: 20, popular: true },
    { name: 'Bronze', visitors: 200, price: 35 },
    { name: 'Silver', visitors: 300, price: 50 },
    { name: 'Gold', visitors: 400, price: 65 },
    { name: 'Platinum', visitors: 500, price: 80 },
    { name: 'Diamond', visitors: 1000, price: 150 },
    { name: 'Titanium', visitors: 2000, price: 280 },
    { name: 'Enterprise', visitors: 3000, price: 400 },
    { name: 'Ultimate', visitors: 5000, price: 650 },
  ],
  annual: [],
};

roomPlans.annual = roomPlans.monthly.map(plan => ({ ...plan, price: calculateAnnualPrice(plan.price) }));


const coloredNamePrice = {
  monthly: 5,
  annual: 45,
}

const planStyles: {[key: string]: { icon: React.ReactNode, gradient: string, textColor: string, buttonClass: string }} = {
    Trial: { icon: <Users className="h-8 w-8" />, gradient: "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800", textColor: "text-gray-800 dark:text-gray-200", buttonClass: "bg-gray-600 hover:bg-gray-700" },
    Starter: { icon: <Users className="h-8 w-8" />, gradient: "from-green-100 to-green-200 dark:from-green-800 dark:to-green-900", textColor: "text-green-800 dark:text-green-200", buttonClass: "bg-green-600 hover:bg-green-700" },
    Community: { icon: <Building className="h-8 w-8" />, gradient: "from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900", textColor: "text-blue-800 dark:text-blue-200", buttonClass: "bg-blue-600 hover:bg-blue-700" },
    Bronze: { icon: <Building className="h-8 w-8" />, gradient: "from-orange-200 to-yellow-300 dark:from-orange-800 dark:to-yellow-900", textColor: "text-orange-900 dark:text-orange-200", buttonClass: "bg-orange-500 hover:bg-orange-600" },
    Silver: { icon: <Crown className="h-8 w-8" />, gradient: "from-slate-200 to-gray-300 dark:from-slate-700 dark:to-gray-800", textColor: "text-slate-800 dark:text-slate-200", buttonClass: "bg-slate-600 hover:bg-slate-700" },
    Gold: { icon: <Crown className="h-8 w-8" />, gradient: "from-yellow-200 to-amber-300 dark:from-yellow-700 dark:to-amber-800", textColor: "text-yellow-800 dark:text-yellow-200", buttonClass: "bg-yellow-500 hover:bg-yellow-600" },
    Platinum: { icon: <Crown className="h-8 w-8" />, gradient: "from-cyan-200 to-sky-300 dark:from-cyan-800 dark:to-sky-900", textColor: "text-cyan-800 dark:text-cyan-200", buttonClass: "bg-cyan-600 hover:bg-cyan-700" },
    Diamond: { icon: <Rocket className="h-8 w-8" />, gradient: "from-indigo-200 to-purple-300 dark:from-indigo-800 dark:to-purple-900", textColor: "text-indigo-800 dark:text-indigo-200", buttonClass: "bg-indigo-600 hover:bg-indigo-700" },
    Titanium: { icon: <Rocket className="h-8 w-8" />, gradient: "from-zinc-300 to-stone-400 dark:from-zinc-800 dark:to-stone-900", textColor: "text-zinc-800 dark:text-zinc-200", buttonClass: "bg-zinc-700 hover:bg-zinc-800" },
    Enterprise: { icon: <Rocket className="h-8 w-8" />, gradient: "from-red-300 to-rose-400 dark:from-red-900 dark:to-rose-950", textColor: "text-red-800 dark:text-red-200", buttonClass: "bg-red-700 hover:bg-red-800" },
    Ultimate: { icon: <Rocket className="h-8 w-8" />, gradient: "from-black to-gray-900 dark:from-black dark:to-gray-900", textColor: "text-white", buttonClass: "bg-black hover:bg-gray-800" },
};


export default function PricingClient() {
  const { t, lang } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isNameAnnual, setIsNameAnnual] = useState(false);

  const activeRoomPlans = isAnnual ? roomPlans.annual : roomPlans.monthly;
  const activeNamePrice = isNameAnnual ? coloredNamePrice.annual : coloredNamePrice.monthly;

  const planNames = t.pricingPage.plans as {[key: string]: string};

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto py-12 md:py-20 text-center">
        
        <div className="flex justify-center items-center gap-4 mb-12">
            <Button asChild size="lg" variant="outline">
                <Link href={`/chat-room/${supportRoomId}`} target="_blank">
                    <LifeBuoy className="mr-2 h-5 w-5" />
                    {t.pricingPage.supportButton}
                </Link>
            </Button>
            <Button asChild size="lg">
                <Link href={`/chat-room/${supportRoomId}`} target="_blank">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t.pricingPage.salesButton}
                </Link>
            </Button>
        </div>

        <div className="flex flex-col items-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {t.pricingPage.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {t.pricingPage.subtitle}
            </p>
            <div className="flex items-center space-x-2 mt-8">
            <Label htmlFor="billing-cycle">{t.pricingPage.monthly}</Label>
            <Switch id="billing-cycle" checked={isAnnual} onCheckedChange={setIsAnnual} />
            <Label htmlFor="billing-cycle">
                {t.pricingPage.yearly}
                <span className="ml-2 text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md">{t.pricingPage.save}</span>
            </Label>
            </div>
        </div>

        <Carousel
            opts={{
                align: "start",
                loop: false,
                direction: lang === 'ar' ? 'rtl' : 'ltr',
            }}
            className="w-full"
            >
            <CarouselContent className="-ml-4">
                {activeRoomPlans.map((plan, index) => {
                    const style = planStyles[plan.name as keyof typeof planStyles] || planStyles.Trial;
                    return (
                        <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                <Card className={cn(
                                    `flex flex-col h-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`,
                                    plan.popular ? 'border-primary border-2' : 'border-border'
                                )}>
                                    {plan.popular && (
                                    <div className="bg-primary text-primary-foreground text-sm font-bold py-1 text-center rounded-t-lg flex items-center justify-center gap-1">
                                        <Star className="h-4 w-4" /> {t.pricingPage.mostPopular}
                                    </div>
                                    )}
                                    <CardHeader className={cn("text-center pt-8 pb-4 bg-gradient-to-br rounded-t-md", style.gradient)}>
                                        <div className={cn("mx-auto mb-4 p-4 rounded-full bg-white/30", style.textColor)}>
                                            {style.icon}
                                        </div>
                                        <CardTitle className={cn("text-3xl font-bold", style.textColor)}>{planNames[plan.name]}</CardTitle>
                                        <CardDescription className="font-semibold !mt-2">{t.pricingPage.visitorsCapacity} {plan.visitors}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow text-right space-y-4 pt-6">
                                        <p className="text-center">
                                            <span className="text-5xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground">/{isAnnual ? t.pricingPage.yr : t.pricingPage.mo}</span>
                                        </p>
                                        <ul className="space-y-3 text-sm">
                                            {(t.pricingPage.features as string[]).map(feature => (
                                            <li key={feature} className="flex items-center">
                                                <Check className="h-5 w-5 text-green-500 ml-2" />
                                                <span>{feature}</span>
                                            </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="mt-auto p-6">
                                    <Button asChild className={cn("w-full text-lg py-6 font-bold", style.buttonClass)}>
                                        <a href={getWhatsappUrl(`${plan.name} (${isAnnual ? 'Annual' : 'Monthly'})`)} target="_blank" rel="noopener noreferrer">
                                        {t.pricingPage.orderButton}
                                        </a>
                                    </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    )
                })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
            </Carousel>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 mt-16">
            <Card className="flex flex-col md:flex-row items-center p-6 bg-secondary/30">
                <div className="p-6">
                    <Briefcase className="h-16 w-16 text-primary" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold">{t.pricingPage.businessOwnerTitle}</h3>
                    <p className="text-muted-foreground mt-2">{t.pricingPage.businessOwnerText}</p>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href="/reseller">{t.pricingPage.resellerPlansButton}</Link>
                    </Button>
                </div>
            </Card>

            <Card className="flex flex-col md:flex-row items-center p-6 bg-secondary/30">
                <div className="p-6">
                    <Gem className="h-16 w-16 text-blue-500" />
                </div>
                <div className="text-center md:text-left flex-grow">
                    <h3 className="text-xl font-bold">{t.pricingPage.coloredNameTitle}</h3>
                    <p className="text-muted-foreground mt-2">{t.pricingPage.coloredNameText}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mt-4">
                        <Label htmlFor="name-billing-cycle">{t.pricingPage.monthly}</Label>
                        <Switch id="name-billing-cycle" checked={isNameAnnual} onCheckedChange={setIsNameAnnual} />
                        <Label htmlFor="name-billing-cycle">{t.pricingPage.yearly}</Label>
                    </div>
                    <p className="mt-2">
                        <span className="text-3xl font-bold">${activeNamePrice}</span>
                        <span className="text-muted-foreground">/{isNameAnnual ? t.pricingPage.yr : t.pricingPage.mo}</span>
                    </p>
                    <Button asChild className="mt-4 bg-primary text-primary-foreground">
                        <a href={getWhatsappUrl(`Colored Name (${isNameAnnual ? 'Annual' : 'Monthly'})`)} target="_blank" rel="noopener noreferrer">
                        {t.pricingPage.reserveButton}
                        </a>
                    </Button>
                </div>
            </Card>
        </div>

        <div className="text-center">
            <a href={getWhatsappUrl("Direct Order")} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2">
            {t.pricingPage.directOrder} <Check className="h-4 w-4 text-green-500" />
            </a>
        </div>
        </div>
    </div>
  );
}
