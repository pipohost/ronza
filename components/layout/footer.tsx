'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export default function Footer() {
  const { t } = useTranslation();
  
  const footerLinks = [
    { href: '/about', label: t.footer.about },
    { href: '/terms', label: t.footer.terms },
  ];

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-center gap-4 py-8 text-center text-sm text-muted-foreground">
        <p>{t.footer.rights}</p>
        <div className="flex gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p>Ronza4chat - Ronza Chat</p>
      </div>
    </footer>
  );
}
