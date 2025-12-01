
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BellRing, Send } from "lucide-react";
import type { WithId, User } from '@/lib/types';
import { SubmitButton } from '../admin/submit-button';
import { useTranslation } from '@/hooks/use-translation';

interface SendAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: WithId<User>;
  onSendAlert: (message: string) => Promise<void>;
}

export default function SendAlertDialog({ isOpen, onClose, targetUser, onSendAlert }: SendAlertDialogProps) {
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useTranslation();
  const moderationT = t.moderation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    await onSendAlert(message);
    setIsSubmitting(false);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            {moderationT.sendAlertTo.replace('{user}', targetUser.name)}
          </DialogTitle>
          <DialogDescription>
            {moderationT.alertPopupDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="alert-message">{moderationT.alertMessageLabel}</Label>
                <Textarea
                    id="alert-message"
                    placeholder={moderationT.alertMessagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={150}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>{moderationT.cancel}</Button>
                <SubmitButton type="submit" isSubmitting={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {moderationT.sendAlertButton}
                </SubmitButton>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    