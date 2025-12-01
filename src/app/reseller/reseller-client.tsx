'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Info, Server, Users, Settings, LifeBuoy, ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const whatsappNumber = "+972533039834";
const getWhatsappUrl = (planName: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I'm interested in the ${planName} plan.`)}`;
const supportRoomId = "zQ54oMpZFS7gEUhG0f8I";

const resellerPlans = {
  monthly: [
    { name: 'Rooms 25', price: 25 * 2, rooms: 25 },
    { name: 'Rooms 50', price: 50 * 2, rooms: 50 },
    { name: 'Rooms 100', price: 100 * 2, rooms: 100, popular: true },
    { name: 'Rooms 200', price: 200 * 2, rooms: 200 },
    { name: 'Rooms 300', price: 300 * 2, rooms: 300 },
    { name: 'Rooms 500', price: 500 * 2, rooms: 500 },
    { name: 'Rooms 1000', price: 1000 * 2, rooms: 1000 },
    { name: 'Rooms 2000', price: 2000 * 2, rooms: 2000 },
    { name: 'Rooms 3000', price: 3000 * 2, rooms: 3000 },
  ],
  annual: [],
};

// Calculate annual price with 10% discount from (monthly * 12)
resellerPlans.annual = resellerPlans.monthly.map(plan => ({ ...plan, price: Math.round(plan.price * 12 * 0.9) }));

export default function ResellerClient() {
  const { t, lang } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);

  const activePlans = (isAnnual ? resellerPlans.annual : resellerPlans.monthly).sort((a,b) => a.rooms - b.rooms);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="container mx-auto py-12 md:py-20" dir={dir}>

      <div className="flex justify-center items-center gap-4 mb-12">
            <Button asChild size="lg" variant="outline">
                <Link href={`/chat-room/${supportRoomId}`} target="_blank">
                    <LifeBuoy className="mr-2 h-5 w-5" />
                    {t.resellerPage.supportButton}
                </Link>
            </Button>
            <Button asChild size="lg">
                <Link href={`/chat-room/${supportRoomId}`} target="_blank">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t.resellerPage.salesButton}
                </Link>
            </Button>
        </div>

      <div className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          {t.resellerPage.mainTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t.resellerPage.mainSubtitle}
        </p>
      </div>

      <Card className="max-w-4xl mx-auto mb-16 bg-secondary/30 text-right">
        <CardHeader>
          <CardTitle>{t.resellerPage.whatIsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t.resellerPage.whatIsText}
          </p>
          <div>
            <h4 className="font-bold mb-2">{t.resellerPage.panelFeaturesTitle}</h4>
            <ul className="space-y-2">
              {(t.resellerPage.panelFeatures as string[]).map((feature, index) => (
                <li key={index} className="flex items-center"><Check className="h-5 w-5 text-primary ml-2" /> {feature}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">{t.resellerPage.choosePlanTitle}</h2>
        <p className="mt-2 text-muted-foreground">{t.resellerPage.choosePlanSubtitle}</p>
        <div className="flex items-center space-x-2 mt-8">
          <Label htmlFor="billing-cycle" className="font-bold">{t.resellerPage.monthly}</Label>
          <Switch id="billing-cycle" checked={isAnnual} onCheckedChange={setIsAnnual} dir="ltr" />
          <Label htmlFor="billing-cycle" className="font-bold">
            {t.resellerPage.yearly}
            <span className={cn("text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md", lang === 'ar' ? 'mr-2' : 'ml-2')}>{t.resellerPage.save}</span>
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activePlans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col text-right shadow-lg transition-all duration-300 ${plan.popular ? 'border-primary border-2 -translate-y-2' : 'border-border'}`}>
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-sm font-bold py-1 text-center rounded-t-lg flex items-center justify-center gap-1">
                <Star className="h-4 w-4" /> {t.resellerPage.mostPopular}
              </div>
            )}
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-2xl">{t.resellerPage.rooms} {plan.rooms}</CardTitle>
              <CardDescription>{t.resellerPage.reseller} {plan.rooms} {t.resellerPage.rooms}</CardDescription>
              <div>
                <span className="text-4xl font-bold">${plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground">/{isAnnual ? 'yr' : 'mo'}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                 <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 ml-2" />
                    <span>{t.resellerPage.upToRooms} {plan.rooms} {t.resellerPage.rooms}</span>
                  </li>
                {(t.resellerPage.features as string[]).map((feature, index) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 ml-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-primary text-primary-foreground">
                <a href={getWhatsappUrl(`Reseller ${plan.name} (${isAnnual ? 'Annual' : 'Monthly'})`)} target="_blank" rel="noopener noreferrer">
                  <Info className="ml-2 h-4 w-4" />
                  {t.resellerPage.orderButton}
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6 text-center">
          <p className="text-lg">
            {t.resellerPage.paymentNoteText}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t.resellerPage.contactSupport} <a href="mailto:pipohost@gmail.com" className="text-primary hover:underline">pipohost@gmail.com</a>
          </p>
        </Card>
        <div className="text-center">
         <a href={getWhatsappUrl("Direct Order")} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2">
           {t.resellerPage.directOrder} <Check className="h-4 w-4 text-green-500" />
         </a>
       </div>
      </div>

    </div>
  );
}
    