
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from '@/hooks/use-translation';

import type { RegisteredMember, WithId, CosmeticRank } from '@/lib/types';

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
  cosmeticRank: z.enum(['registered_member', 'background_name', 'super_name', 'mythical_admin']).nullable().optional(),
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
  const { t } = useTranslation();
  const texts = t.ownerPanel.memberDialog;
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: isEditing ? {
        name: member.name,
        role: member.role,
        color: member.color,
        password: member.password || '',
        cosmeticRank: member.cosmeticRank || null,
    } : {
      name: '',
      role: 'visitor',
      color: '#000000',
      password: '',
      cosmeticRank: null,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? {
            name: member.name,
            role: member.role,
            color: member.color,
            password: member.password || '',
            cosmeticRank: member.cosmeticRank || null,
        } : {
            name: '',
            role: 'visitor',
            color: '#000000',
            password: '',
            cosmeticRank: null,
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
          <DialogTitle>{isEditing ? texts.editTitle : texts.addTitle}</DialogTitle>
          <DialogDescription>
            {isEditing ? texts.editDescription : texts.addDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{texts.nameLabel}</FormLabel>
                    <FormControl>
                    <Input placeholder={texts.namePlaceholder} {...field} />
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
                    <FormLabel>{texts.passwordLabel}</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder={texts.passwordPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>{texts.roleLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={texts.rolePlaceholder} /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="visitor">{texts.roles.visitor}</SelectItem>
                        <SelectItem value="special">{texts.roles.special}</SelectItem>
                        <SelectItem value="admin">{texts.roles.admin}</SelectItem>
                        <SelectItem value="superadmin">{texts.roles.superadmin}</SelectItem>
                    </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
            <FormField
                control={form.control}
                name="cosmeticRank"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cosmetic Rank</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a cosmetic rank" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="registered_member">Registered Member</SelectItem>
                            <SelectItem value="background_name">Name with Background</SelectItem>
                            <SelectItem value="super_name">Super Name</SelectItem>
                            <SelectItem value="mythical_admin">Mythical Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{texts.colorLabel}</FormLabel>
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
                <Button type="button" variant="ghost" onClick={onClose}>{texts.cancel}</Button>
                <SubmitButton isSubmitting={isSubmitting}>{isEditing ? texts.save : texts.add}</SubmitButton>
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
    const { t } = useTranslation();
    const texts = t.ownerPanel.deleteMemberDialog;

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
                    <AlertDialogTitle>{texts.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {texts.description1}
                        <span className="font-bold"> "{member?.name}"</span>{texts.description2}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button type="button" variant="ghost" disabled={isSubmitting}>{texts.cancel}</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <SubmitButton variant="destructive" onClick={handleDelete} isSubmitting={isSubmitting}>{texts.delete}</SubmitButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
