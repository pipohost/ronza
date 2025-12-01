'use client';

import * as React from 'react';
import type { Room, WithId } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubmitButton } from './submit-button';

interface ClearRoomUsersDialogProps {
    isOpen: boolean;
    onClose: () => void;
    room: WithId<Room> | null;
    onConfirm: () => Promise<void>;
}

export function ClearRoomUsersDialog({ isOpen, onClose, room, onConfirm }: ClearRoomUsersDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleConfirm = async () => {
        if (!room) return;

        setIsSubmitting(true);
        await onConfirm();
        setIsSubmitting(false);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will forcefully remove all users currently listed as 'online' in the room 
                        <span className="font-bold"> "{room?.name}"</span> and reset the user count to 0. 
                        This action is useful for clearing "stuck" or disconnected users.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <SubmitButton variant="destructive" onClick={handleConfirm} isSubmitting={isSubmitting}>Confirm & Clear</SubmitButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
