
'use client';

import Link from 'next/link';
import {
  Briefcase,
  Download,
  Info,
  LayoutGrid,
  Library,
  Sparkles,
  DollarSign,
  HelpCircle,
  Menu,
  Languages,
  Palette,
  BookOpen,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';


function Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
                <div className="font-bold text-primary text-lg leading-tight">Ronza Chat</div>
                <div className="text-sm text-muted-foreground leading-tight">Rooms</div>
            </div>
        </div>
    )
}

export default function Header() {
  const { t, toggleLanguage, lang } = useTranslation();
  
  const navLinks = [
    { href: '/journal', label: t.header.journal, icon: <Sparkles /> },
    { href: '/features', label: t.header.features, icon: <ListChecks /> },
    { href: '/support', label: t.header.support, icon: <HelpCircle /> },
    { href: '/download', label: t.header.download, icon: <Download /> },
    { href: '/pricing', label: t.header.pricing, icon: <DollarSign /> },
    { href: '/color-pricing', label: t.header.colorPricing, icon: <Palette /> },
    { href: '/reseller', label: t.header.reseller, icon: <Briefcase /> },
    { href: '/about', label: t.header.about, icon: <Info /> },
    { href: '/terms', label: t.header.terms, icon: <Library /> },
  ];

  const renderNavLinks = () =>
    navLinks.map((link) => (
      <Button
        key={link.href}
        asChild
        variant="ghost"
        className="flex flex-col items-center justify-center h-20 w-24 gap-1"
      >
        <Link href={link.href}>
          {link.icon}
          <span className="text-xs text-center">{link.label}</span>
        </Link>
      </Button>
    ));

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className="container flex flex-col items-center justify-between py-2 gap-4">
        <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={toggleLanguage}>
              <Languages className="mr-2 h-4 w-4" />
              {lang === 'ar' ? 'English' : 'العربية'}
            </Button>
            <Link href="/" className="flex items-center space-x-2">
                <Logo />
            </Link>
        </div>

        <div className="hidden md:flex flex-wrap items-center justify-center gap-2 w-full">
            {renderNavLinks()}
        </div>

        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side={lang === 'ar' ? 'right' : 'left'}>
                    <VisuallyHidden>
                      <h2 id="mobile-menu-title">Main Menu</h2>
                    </VisuallyHidden>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        {renderNavLinks()}
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      </div>
    </header>
  );
}
