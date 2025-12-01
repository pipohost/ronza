
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code, Mic, Video, Globe, ShieldCheck, MessageSquareText, LayoutDashboard, Users, TrendingUp, Rocket, Crown, MapPin, Mail, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const featureIcons = {
  "شات صوتي متكامل": <Mic className="w-6 h-6 text-primary" />,
  "Integrated Voice Chat": <Mic className="w-6 h-6 text-primary" />,
  "شات كتابي تفاعلي": <MessageSquareText className="w-6 h-6 text-primary" />,
  "Interactive Text Chat": <MessageSquareText className="w-6 h-6 text-primary" />,
  "شات مرئي (فيديو)": <Video className="w-6 h-6 text-primary" />,
  "Video Chat": <Video className="w-6 h-6 text-primary" />,
  "لوحة إدارية حديثة": <LayoutDashboard className="w-6 h-6 text-primary" />,
  "Modern Admin Panel": <LayoutDashboard className="w-6 h-6 text-primary" />,
  "تشغيل مباشر من المتصفح": <Globe className="w-6 h-6 text-primary" />,
  "Direct Browser Operation": <Globe className="w-6 h-6 text-primary" />,
  "سعة الغرف مرنة": <Users className="w-6 h-6 text-primary" />,
  "Flexible Room Capacity": <Users className="w-6 h-6 text-primary" />,
  "أمان واستقرار": <ShieldCheck className="w-6 h-6 text-primary" />,
  "Security and Stability": <ShieldCheck className="w-6 h-6 text-primary" />,
  "التحديثات المستمرة": <TrendingUp className="w-6 h-6 text-primary" />,
  "Continuous Updates": <TrendingUp className="w-6 h-6 text-primary" />,
};


export default function AboutPage() {
  const { t, lang } = useTranslation();
  const whatsappNumber = "+972533039834";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const manager = t.aboutPage.manager;
  
  return (
    <div className="bg-secondary/30 py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container max-w-5xl mx-auto">
        <Card className="shadow-lg mb-12">
            <CardHeader className="text-center">
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Code className="w-6 h-6 text-primary" />
                    <span>{t.aboutPage.companyTitle}</span>
                </h1>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    {t.aboutPage.companySubtitle}
                </p>
            </CardContent>
        </Card>

        <Card className="shadow-lg mb-12">
            <CardHeader className="text-center">
                <h2 className="text-3xl font-bold">{t.aboutPage.featuresTitle}</h2>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                    {t.aboutPage.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                                {featureIcons[feature.title as keyof typeof featureIcons]}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-xl mb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="text-center items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Crown className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{manager.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto border-4 border-primary/50">
                    <AvatarImage src="https://picsum.photos/seed/ronza_team/200/200" alt={manager.name} />
                    <AvatarFallback>RT</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{manager.name}</h3>
                <div className="space-y-2 text-muted-foreground">
                    <p className="flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{manager.address}</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <a href={`mailto:${manager.postalCode}`} className="hover:underline">{manager.postalCode}</a>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                         <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" dir="ltr">
                            {whatsappNumber}
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>

        <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center shadow-lg">
            <Rocket className="mx-auto h-10 w-10 text-primary mb-4" />
            <h3 className="text-2xl font-bold">
                {t.aboutPage.ctaTitle}
            </h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-2xl mx-auto">
                {t.aboutPage.ctaSubtitle}
            </p>
            <Button asChild size="lg">
                <Link href="/pricing">{t.aboutPage.ctaButton}</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
