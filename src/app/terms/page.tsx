
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copyright, Users, ShieldCheck, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const SectionCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <Card className="shadow-lg bg-secondary/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-xl text-primary">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="text-muted-foreground space-y-3">
      {children}
    </CardContent>
  </Card>
);

export default function TermsPage() {
  const { t, lang } = useTranslation();

    return (
      <div className="bg-background py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container max-w-5xl mx-auto space-y-8">
          <div className="space-y-4 text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              {t.termsPage.mainTitle}
            </h1>
          </div>
          
          <SectionCard icon={<Copyright className="w-6 h-6" />} title={t.termsPage.copyrightTitle}>
            <p>{t.termsPage.copyrightText1}</p>
            <p>{t.termsPage.copyrightText2}</p>
          </SectionCard>

          <SectionCard icon={<Users className="w-6 h-6" />} title={t.termsPage.policyTitle}>
            <p>{t.termsPage.policyText}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <h3 className="font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {t.termsPage.allowed}
                </h3>
                <ul className="space-y-2 pr-4">
                  {t.termsPage.allowedItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-red-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  {t.termsPage.forbidden}
                </h3>
                <ul className="space-y-2 pr-4">
                  {t.termsPage.forbiddenItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<ShieldCheck className="w-6 h-6" />} title={t.termsPage.securityTitle}>
            <p>{t.termsPage.securityText}</p>
          </SectionCard>

          <SectionCard icon={<RefreshCw className="w-6 h-6" />} title={t.termsPage.updatesTitle}>
            <p>{t.termsPage.updatesText}</p>
          </SectionCard>
        </div>
      </div>
    );
  }
