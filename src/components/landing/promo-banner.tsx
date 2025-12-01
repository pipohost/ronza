'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PhoneOutgoing } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.55-.02.98-.09.43-.55.83-1.13 1.05-.58.22-1.13.3-1.98.18-.85-.13-2.08-.5-3.33-1.33-1.25-.83-2.2-1.85-2.9-2.93-.7-.95-1.13-2.05-1.13-3.15 0-1.1.48-1.95 1.13-2.6.65-.65 1.5-.98 2.6-.98.25 0 .5.03.75.08.43.1.7.63.78 1.05.08.43.05.85-.03 1.13-.08.28-.2.53-.35.7-.15.18-.3.35-.5.65l-.33.33c-.08.08-.13.18-.1.3.03.13.25.55.65 1.13.4.58.95 1.13 1.63 1.6.68.48 1.13.7 1.35.73.18.03.3-.03.4-.13l.33-.33c.2-.2.4-.33.6-.45.2-.13.4-.18.58-.18.2 0 .43.05.6.13zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/>
      </svg>
    )
}

export default function PromoBanner() {
  const { t } = useTranslation();
  const imageData = findImage('promo-banner-girl');
  const whatsappNumber = "+972533039834";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("أريد الاستفسار عن أسعار الغرف الصوتية")}`;

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % t.promoBanner.phrases.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(intervalId);
  }, [t.promoBanner.phrases.length]);

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 promo-banner-bg text-white shadow-2xl max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="flex-1 text-center md:text-right">
              <h2 key={currentPhraseIndex} className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight promo-text-glow animate-in fade-in duration-500">
                {t.promoBanner.phrases[currentPhraseIndex]}
              </h2>
              <p className="mt-4 text-lg text-blue-200">
                {t.promoBanner.subtitle}
              </p>
              <Button asChild size="lg" className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <PhoneOutgoing className="mr-2 h-6 w-6" />
                  {t.promoBanner.button}
                </a>
              </Button>
            </div>

            <div className="flex-shrink-0">
              {imageData && (
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/50 shadow-lg animate-in zoom-in-75 duration-500">
                  <Image
                    src={imageData.imageUrl}
                    alt={imageData.description}
                    fill
                    className="object-cover"
                    data-ai-hint={imageData.imageHint}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
