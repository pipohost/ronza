
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { ListChecks, LayoutDashboard, Briefcase, Settings, BarChart, Users, Home, Edit, Shield, Palette, Newspaper, Key, Code, MessageSquare, Lock, Volume2, Mic, Text, Eye, UserCheck, Star, Sparkles } from 'lucide-react';

const Section = ({ title, description, icon, children }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Card className="shadow-lg bg-secondary/20">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">{icon}</div>
                <div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </CardContent>
    </Card>
);

const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
    <div className="flex items-start gap-4 p-4 bg-background rounded-lg border">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);


export default function FeaturesPage() {
    const { t, lang } = useTranslation();
    const features = t.featuresPage;

    const resellerFeatures = [
        { icon: <BarChart />, title: features.reseller.stats, description: features.reseller.statsDesc },
        { icon: <Home />, title: features.reseller.roomMgmt, description: features.reseller.roomMgmtDesc },
        { icon: <Palette />, title: features.reseller.coloredNames, description: features.reseller.coloredNamesDesc },
        { icon: <Code />, title: features.reseller.embed, description: features.reseller.embedDesc },
        { icon: <Key />, title: features.reseller.password, description: features.reseller.passwordDesc },
    ];

    const ownerFeatures = [
        { icon: <Settings />, title: features.owner.general, description: features.owner.generalDesc },
        { icon: <Users />, title: features.owner.members, description: features.owner.membersDesc },
        { icon: <Shield />, title: features.owner.security, description: features.owner.securityDesc },
        { icon: <Lock />, title: features.owner.access, description: features.owner.accessDesc },
        { icon: <Volume2 />, title: features.owner.visitor, description: features.owner.visitorDesc },
        { icon: <MessageSquare />, title: features.owner.moderation, description: features.owner.moderationDesc },
    ];

    const inRoomFeatures = [
        { icon: <Shield />, title: features.inRoom.moderation, description: features.inRoom.moderationDesc },
        { icon: <Star />, title: features.inRoom.ranks, description: features.inRoom.ranksDesc },
        { icon: <Sparkles />, title: features.inRoom.coloredNames, description: features.inRoom.coloredNamesDesc },
        { icon: <Mic />, title: features.inRoom.voiceChat, description: features.inRoom.voiceChatDesc },
        { icon: <Text />, title: features.inRoom.textChat, description: features.inRoom.textChatDesc },
        { icon: <UserCheck />, title: features.inRoom.privateChat, description: features.inRoom.privateChatDesc },
    ];

    return (
        <div className="py-12 md:py-20 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <ListChecks className="mx-auto h-12 w-12 text-primary" />
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{features.title}</h1>
                    <p className="max-w-3xl mx-auto text-lg text-muted-foreground">{features.subtitle}</p>
                </div>
                
                <Section title={features.reseller.title} description={features.reseller.description} icon={<Briefcase />}>
                    {resellerFeatures.map(f => <FeatureCard key={f.title} {...f} />)}
                </Section>

                <Section title={features.owner.title} description={features.owner.description} icon={<Settings />}>
                    {ownerFeatures.map(f => <FeatureCard key={f.title} {...f} />)}
                </Section>

                <Section title={features.inRoom.title} description={features.inRoom.description} icon={<Users />}>
                    {inRoomFeatures.map(f => <FeatureCard key={f.title} {...f} />)}
                </Section>
            </div>
        </div>
    );
}
