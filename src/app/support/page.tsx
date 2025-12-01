
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useTranslation } from "@/hooks/use-translation";

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

const FeatureCard = ({ item, reverse }: { item: { id: string, title: string, description: string }, reverse?: boolean }) => {
  const imageData = findImage(item.id);
  const imageHint = PlaceHolderImages.find(img => img.id === item.id)?.imageHint || '';
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div className={`flex flex-col md:flex-row items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-full md:w-1/2">
            {imageData && (
              <Image 
                src={imageData.imageUrl} 
                alt={item.title} 
                width={600} 
                height={400} 
                className="object-cover w-full h-full"
                data-ai-hint={imageHint}
                />
            )}
          </div>
          <div className="w-full md:w-1/2 p-6 space-y-3">
            <h3 className="text-xl font-bold text-primary">{item.title}</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


export default function SupportPage() {
  const { t, lang } = useTranslation();
  const { features } = t.supportPage;
  const chatRoomInterfaceItems = features.slice(0, 3);
  const adminPanelItems = features.slice(3);

    return (
      <div className="container max-w-6xl mx-auto py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="space-y-4 text-center mb-16">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{t.supportPage.mainTitle}</h1>
        </div>

        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t.supportPage.interfaceTitle}</h2>
                <div className="grid gap-8">
                    {chatRoomInterfaceItems.map((item, index) => (
                        <FeatureCard key={item.id} item={item} reverse={index % 2 === 1} />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t.supportPage.adminPanelTitle}</h2>
                <div className="grid gap-8">
                    {adminPanelItems.map((item, index) => (
                        <FeatureCard key={item.id} item={item} reverse={index % 2 === 1} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }
