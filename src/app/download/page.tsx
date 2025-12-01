
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Info, Smartphone, Monitor } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

export default function DownloadPage() {
  const { t, lang } = useTranslation();
  const mobileImageData = findImage('install-mobile');
  const desktopImageData = findImage('install-desktop');

  return (
    <div className="container mx-auto py-12 md:py-20 text-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
        {t.downloadPage.title}
      </h1>
      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
        {t.downloadPage.subtitle}
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Mobile Card */}
        <Card className="text-right shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.downloadPage.mobileTitle}</span>
              <Smartphone className="h-6 w-6 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t.downloadPage.mobileSubtitle}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.mobileStep1Title}</h3>
                <p>{t.downloadPage.mobileStep1Text}</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.mobileStep2Title}</h3>
                <p><strong>Android (Chrome):</strong> {t.downloadPage.mobileStep2Android}</p>
                <p><strong>iOS (Safari):</strong> {t.downloadPage.mobileStep2Ios}</p>
              </div>
              {mobileImageData && (
                <Image
                  src={mobileImageData.imageUrl}
                  alt="Mobile installation steps"
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full"
                  data-ai-hint={mobileImageData.imageHint}
                />
              )}
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.mobileStep3Title}</h3>
                <p>{t.downloadPage.mobileStep3Text}</p>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground">
              <Info className="ml-2 h-4 w-4" />
              {t.downloadPage.showHintButton}
            </Button>
          </CardContent>
        </Card>

        {/* Desktop Card */}
        <Card className="text-right shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.downloadPage.desktopTitle}</span>
              <Monitor className="h-6 w-6 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t.downloadPage.desktopSubtitle}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.desktopStep1Title}</h3>
                <p>{t.downloadPage.desktopStep1Text}</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.desktopStep2Title}</h3>
                <p>{t.downloadPage.desktopStep2Text}</p>
              </div>
               {desktopImageData && (
                <Image
                  src={desktopImageData.imageUrl}
                  alt="Desktop installation steps"
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full"
                  data-ai-hint={desktopImageData.imageHint}
                />
              )}
              <div>
                <h3 className="font-bold text-primary">{t.downloadPage.desktopStep3Title}</h3>
                <p>{t.downloadPage.desktopStep3Text}</p>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground">
              <Info className="ml-2 h-4 w-4" />
              {t.downloadPage.showHintButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
