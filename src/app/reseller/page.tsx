
'use client';

import ResellerClient from './reseller-client';
import { useTranslation } from '@/hooks/use-translation';

export default function ResellerPage() {
    const { lang } = useTranslation();
    return (
        <div className="container mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <ResellerClient />
        </div>
    );
}
