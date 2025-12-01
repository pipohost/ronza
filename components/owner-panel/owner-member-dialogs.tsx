'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import type { RegisteredMember, WithId } from '@/lib/types';

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
import { SubmitButton } from '../admin/submit-button';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  role: z.enum(['visitor', 'special', 'admin', 'superadmin']),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code.'),
  password: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: WithId<RegisteredMember> | null;
  onSave: (data: MemberFormValues) => Promise<void>;
}

export function MemberFormDialog({ isOpen, onClose, member, onSave }: MemberFormDialogProps) {
  const isEditing = !!member;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: isEditing ? {
        name: member.name,
        role: member.role,
        color: member.color,
        password: member.password || '',
    } : {
      name: '',
      role: 'visitor',
      color: '#000000',
      password: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? {
            name: member.name,
            role: member.role,
            color: member.color,
            password: member.password || '',
        } : {
            name: '',
            role: 'visitor',
            color: '#000000',
            password: '',
        });
    }
  }, [isOpen, member, isEditing, form]);

  const handleSubmit = async (values: MemberFormValues) => {
    setIsSubmitting(true);
    await onSave(values);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this role.' : 'Create a new role for a name in your room.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                    <Input placeholder="Member's Name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="Password for this member" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
             <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Input type="color" className="p-1 h-10 w-14" {...field} />
                            <Input placeholder="#000000" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <SubmitButton isSubmitting={isSubmitting}>{isEditing ? 'Save Changes' : 'Add Role'}</SubmitButton>
            </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


interface DeleteMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: WithId<RegisteredMember> | null;
    onDelete: () => Promise<void>;
}

export function DeleteMemberDialog({ isOpen, onClose, member, onDelete }: DeleteMemberDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleDelete = async () => {
        if (!member) return;
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
                        This action cannot be undone. This will permanently delete the role for the name
                        <span className="font-bold"> "{member?.name}"</span> from your room.
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
