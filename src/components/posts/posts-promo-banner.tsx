
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function PostsPromoBanner() {
    const { t } = useTranslation();
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    const phrases = t.postsPage.promoPhrases;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <Link href="/" className="block max-w-2xl mx-auto">
            <div className="relative rounded-lg overflow-hidden p-6 promo-banner-bg text-white shadow-lg cursor-pointer transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <Megaphone className="h-10 w-10 text-white/80 flex-shrink-0" />
                    <div className="flex-1 text-center">
                         <h3 key={currentPhraseIndex} className="text-lg md:text-xl font-bold tracking-tight animate-in fade-in-0 duration-1000">
                           {phrases[currentPhraseIndex]}
                        </h3>
                    </div>
                </div>
            </div>
        </Link>
    );
}
