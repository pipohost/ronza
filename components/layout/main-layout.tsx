
'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingWhatsappButton from '@/components/layout/floating-whatsapp-button';

// This component now only renders the full layout.
// The logic to decide *if* it should be rendered is moved to the Providers component.
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWhatsappButton />
        </div>
    );
}
