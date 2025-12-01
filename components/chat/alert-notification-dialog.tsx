
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { BellRing, X } from 'lucide-react';
import type { User, Alert, WithId } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

interface AlertNotificationDialogProps {
  currentUser?: WithId<User>;
  onClearAlerts: () => void;
}

export default function AlertNotificationDialog({ currentUser, onClearAlerts }: AlertNotificationDialogProps) {
  const { t } = useTranslation();
  const moderationT = t.moderation;
  const [activeAlert, setActiveAlert] = React.useState<Alert | null>(null);

  React.useEffect(() => {
    if (currentUser?.alerts && currentUser.alerts.length > 0) {
      // Show the most recent alert
      setActiveAlert(currentUser.alerts[currentUser.alerts.length - 1]);
    }
  }, [currentUser?.alerts]);

  const handleClose = () => {
    setActiveAlert(null);
    // After closing, clear all alerts from the backend.
    // This prevents old alerts from reappearing on refresh.
    onClearAlerts();
  };

  if (!activeAlert) {
    return null;
  }

  return (
    <AlertDialog open={!!activeAlert} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="text-center items-center">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full mb-3">
              <BellRing className="h-8 w-8 text-yellow-500" />
          </div>
          <AlertDialogTitle className="text-2xl">
            {moderationT.alertFromAdmin}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground pt-2">
            {moderationT.messageFrom.replace('{user}', activeAlert.fromName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 text-center text-lg bg-secondary/50 rounded-md">
            {activeAlert.text}
        </div>
        <AlertDialogFooter className="sm:justify-center">
            <Button onClick={handleClose} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                {moderationT.close}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    