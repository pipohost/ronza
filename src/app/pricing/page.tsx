
'use client';

import PricingClient from './pricing-client';
import { useTranslation } from '@/hooks/use-translation';

export default function PricingPage() {
    const { t, lang } = useTranslation();
    return (
        <div className="container mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <PricingClient />
        </div>
    );
}
