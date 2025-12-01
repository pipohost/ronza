'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="w-full py-12 md:py-20 lg:py-28 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              {t.hero.title}
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              {t.hero.subtitle}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/journal">
              <BookOpen className="mr-2 h-5 w-5" />
              {t.hero.journalButton}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
