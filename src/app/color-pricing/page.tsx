
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Crown, Heart } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { CosmeticRank } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const whatsappNumber = "+972533039834";
const getWhatsappUrl = (planName: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I'm interested in reserving the ${planName} colored name.`)}`;

const rankStyles: { [key in CosmeticRank]: { card: string, name: string } } = {
  super_name: {
    card: 'superadmin-gradient text-white shadow-lg shadow-purple-500/30',
    name: 'superadmin-text-gradient font-bold',
  },
  background_name: {
    card: 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-purple-500/30 text-white',
    name: 'text-white font-semibold',
  },
  registered_member: { 
    card: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    name: 'text-green-600 dark:text-green-400 font-medium',
  },
};

const renderStars = (rank: CosmeticRank) => {
    const starConfig = {
      super_name: { count: 5, className: 'text-yellow-400', heart: true },
      background_name: { count: 6, className: 'text-blue-400', heart: true },
      registered_member: { count: 4, className: 'text-green-400', heart: false },
    };

    const config = starConfig[rank];
    if (!config) return null;

    return (
        <div className="flex justify-center items-center gap-0.5">
            {config.heart && <Heart className="h-4 w-4 text-red-400" fill="currentColor" />}
            {Array.from({ length: config.count }).map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', config.className)} fill="currentColor" />
            ))}
            {config.heart && <Heart className="h-4 w-4 text-red-400" fill="currentColor" />}
        </div>
    );
};

export default function ColorPricingPage() {
  const { t, lang } = useTranslation();
  const pricingTiers = t.colorPricingPage.tiers;
  
  const plans: { rank: CosmeticRank, price: number }[] = [
    { rank: 'registered_member', price: 10 },
    { rank: 'background_name', price: 20 },
    { rank: 'super_name', price: 40 },
  ];

  return (
    <div className="container mx-auto py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          {t.colorPricingPage.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t.colorPricingPage.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const tierDetails = pricingTiers[plan.rank];
          const styles = rankStyles[plan.rank];

          return (
            <Card key={plan.rank} className={cn("flex flex-col text-center shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2", styles.card)}>
              <CardHeader className="pt-8">
                <CardTitle className={cn("text-3xl font-bold", styles.name)}>
                  {tierDetails.title}
                </CardTitle>
                <div className="mt-2 h-6">{renderStars(plan.rank)}</div>
                <CardDescription className={cn("font-semibold !mt-4", plan.rank !== 'registered_member' ? 'text-gray-200' : 'text-muted-foreground')}>
                  {tierDetails.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div className={cn("flex items-center gap-3 p-2 rounded-lg transition-all duration-300 border-0 w-full", styles.card, plan.rank !== 'registered_member' && 'bg-black/20')}>
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                        <AvatarImage src="https://picsum.photos/seed/demouser/100/100" alt={tierDetails.title} />
                        <AvatarFallback>{tierDetails.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden text-left">
                        <div className="flex items-center gap-2">
                            <p className={cn("truncate font-medium", styles.name)}>{tierDetails.title}</p>
                        </div>
                         <div className="flex items-center gap-2">
                           {renderStars(plan.rank)}
                        </div>
                    </div>
                </div>
                <p className="text-center">
                  <span className={cn("text-5xl font-bold", plan.rank !== 'registered_member' && 'text-white' )}>${plan.price}</span>
                  <span className={cn(plan.rank !== 'registered_member' ? 'text-gray-300' : 'text-muted-foreground')}>/{t.pricingPage.mo}</span>
                </p>
              </CardContent>
              <CardFooter className="mt-auto p-6">
                <Button asChild className="w-full text-lg py-6 font-bold bg-green-500 hover:bg-green-600 text-white">
                  <a href={getWhatsappUrl(tierDetails.title)} target="_blank" rel="noopener noreferrer">
                    {t.colorPricingPage.orderButton}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

       <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>{t.colorPricingPage.footerNote}</p>
      </div>
    </div>
  );
}
