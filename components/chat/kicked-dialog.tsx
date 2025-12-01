'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from 'lucide-react';

interface KickedDialogProps {
  reason: string;
  onClose: () => void;
}

export default function KickedDialog({ reason, onClose }: KickedDialogProps) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mb-3">
                <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl">لقد تم طردك</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
                السبب: <span className="font-semibold">{reason || "لم يتم تحديد سبب."}</span>
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            إغلاق
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
