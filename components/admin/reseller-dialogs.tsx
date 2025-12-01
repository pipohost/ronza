'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Reseller, WithId } from '@/lib/types';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';

const resellerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  rooms: z.coerce.number().min(1, 'Must have at least 1 room.'),
  status: z.enum(['Active', 'Expired']),
  renewalDate: z.string().min(1, 'Renewal date is required.'),
  userId: z.string().min(1, 'User ID is required.'),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

export type ResellerFormValues = z.infer<typeof resellerSchema>;

interface ResellerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reseller: WithId<Reseller> | null;
  onSave: (data: ResellerFormValues) => Promise<void>;
}

export function ResellerFormDialog({ isOpen, onClose, reseller, onSave }: ResellerFormDialogProps) {
  const isEditing = !!reseller;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ResellerFormValues>({
    resolver: zodResolver(resellerSchema),
    defaultValues: isEditing ? { ...reseller, password: reseller.password || ''} : {
      name: '',
      rooms: 10,
      status: 'Active',
      renewalDate: '',
      userId: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? { ...reseller, password: reseller.password || ''} : {
            name: '',
            rooms: 10,
            status: 'Active',
            renewalDate: '',
            userId: '',
            password: '',
        });
    }
  }, [isOpen, reseller, isEditing, form]);

  const handleSubmit = async (values: ResellerFormValues) => {
    setIsSubmitting(true);
    await onSave(values);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Reseller' : 'Add New Reseller'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this reseller.' : 'Create a new reseller account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <Form {...form}>
                <form id="reseller-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Reseller Name</FormLabel><FormControl><Input placeholder="Global Host" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Panel Password</FormLabel><FormControl><Input type="password" placeholder="Reseller panel password" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rooms" render={({ field }) => (
                        <FormItem><FormLabel>Number of Rooms</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renewalDate" render={({ field }) => (
                        <FormItem><FormLabel>Renewal Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="userId" render={({ field }) => (
                        <FormItem><FormLabel>User ID</FormLabel><FormControl><Input placeholder="Firebase User ID" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    {isEditing && reseller?.apiKey && (
                        <FormItem><FormLabel>API Key</FormLabel><FormControl><Input readOnly value={reseller.apiKey} /></FormControl></FormItem>
                    )}
                    {isEditing && (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"><FormLabel>Is Active</FormLabel></div>
                            <FormControl><Switch checked={reseller?.isActive} disabled /></FormControl>
                        </FormItem>
                    )}
                </form>
            </Form>
        </div>
        <DialogFooter className="pt-4 flex-shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <SubmitButton isSubmitting={isSubmitting} form="reseller-form" type="submit">
                {isEditing ? 'Save Changes' : 'Add Reseller'}
            </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface DeleteResellerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    reseller: WithId<Reseller> | null;
    onDelete: () => Promise<void>;
}

export function DeleteResellerDialog({ isOpen, onClose, reseller, onDelete }: DeleteResellerDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleDelete = async () => {
        if (!reseller) return;
        
        setIsSubmitting(true);
        await onDelete();
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the reseller 
                        <span className="font-bold"> "{reseller?.name}"</span> and all their associated rooms.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <SubmitButton variant="destructive" onClick={handleDelete} isSubmitting={isSubmitting}>Delete</SubmitButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
