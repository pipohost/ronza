'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OwnerRoomSettings from "@/components/owner-panel/room-settings"
import OwnerMemberManagement from "@/components/owner-panel/member-management"
import OwnerSecurity from '@/components/owner-panel/security';
import type { WithId, Room, RegisteredMember, BannedUser } from '@/lib/types';
import OwnerModeration from '@/components/owner-panel/moderation';
import { Button } from '@/components/ui/button';
import { LogOut, Languages } from 'lucide-react';
import { TranslationProvider, useTranslation } from '@/hooks/use-translation';

// We need to wrap the client component in the provider
function OwnerPanelClientContent({ roomData, members, bannedUsers, activityLog, signOutAction }: any) {
    const { t, toggleLanguage, lang, dir } = useTranslation();
    const panelTexts = t.adminPanel.owner;
    const tabTexts = t.adminPanel.tabs;
    
    return (
        <div className="container mx-auto py-10" dir={dir}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{panelTexts.title}</h1>
                    <p className="text-muted-foreground">{panelTexts.description} <span className="font-semibold text-primary">{roomData?.name || 'Unknown Room'}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={toggleLanguage}>
                        <Languages className="mr-2 h-4 w-4" />
                        {lang === 'ar' ? 'English' : 'العربية'}
                    </Button>
                    <form action={signOutAction}>
                        <Button variant="outline" type="submit">
                            <LogOut className="mr-2 h-4 w-4" />
                            {t.adminPanel.signOut}
                        </Button>
                    </form>
                </div>
            </div>

            <Tabs defaultValue="settings" className="mt-8">
                <TabsList className="grid w-full grid-cols-4 md:w-[600px]">
                    <TabsTrigger value="settings">{tabTexts.settings}</TabsTrigger>
                    <TabsTrigger value="members">{tabTexts.members}</TabsTrigger>
                    <TabsTrigger value="security">{tabTexts.security}</TabsTrigger>
                    <TabsTrigger value="moderation">{tabTexts.moderation}</TabsTrigger>
                </TabsList>
                <TabsContent value="settings">
                    <OwnerRoomSettings room={roomData} />
                </TabsContent>
                <TabsContent value="members">
                    <OwnerMemberManagement roomId={roomData.id} initialMembers={members} />
                </TabsContent>
                <TabsContent value="security">
                    <OwnerSecurity 
                        roomId={roomData.id} 
                        initialBannedUsers={bannedUsers} 
                        initialActivityLog={activityLog} 
                    />
                </TabsContent>
                <TabsContent value="moderation">
                    <OwnerModeration room={roomData} />
                </TabsContent>
            </Tabs>
            <div className="mt-16 text-center text-sm text-muted-foreground">
                Ronza4Chat Version 1.0.0
            </div>
        </div>
    );
}

export default function OwnerPanelClient(props: any) {
    return (
        <TranslationProvider>
            <OwnerPanelClientContent {...props} />
        </TranslationProvider>
    )
}
