'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendAnnouncement } from '@/app/actions/owner-panel';
import { SubmitButton } from '../admin/submit-button';
import { useTranslation } from '@/hooks/use-translation';
import { Megaphone } from 'lucide-react';

interface AnnouncementsProps {
    roomId: string;
}

export default function Announcements({ roomId }: AnnouncementsProps) {
    const [message, setMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();
    const texts = t.ownerPanel.announcements;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast({ variant: "destructive", title: texts.errorTitle, description: texts.emptyError });
            return;
        }
        setIsSubmitting(true);
        try {
            await sendAnnouncement(roomId, message);
            toast({ title: texts.successTitle, description: texts.successDescription });
            setMessage('');
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.errorTitle, description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            {texts.title}
        </CardTitle>
        <CardDescription>
          {texts.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
                placeholder={texts.placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <SubmitButton isSubmitting={isSubmitting}>{texts.button}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
