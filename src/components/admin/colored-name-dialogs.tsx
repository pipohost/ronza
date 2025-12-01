
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { ReservedName, WithId, CosmeticRank, UserRole } from '@/lib/types';

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

const coloredNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code.'),
  reseller: z.string().min(1, 'Reseller/Owner ID is required.'),
  renewalDate: z.string().min(1, 'Renewal date is required.'),
  password: z.string().optional(),
  role: z.enum(['visitor', 'special', 'admin', 'superadmin']),
  cosmeticRank: z.enum(['registered_member', 'background_name', 'super_name', 'mythical_admin']).nullable(),
});

export type ColoredNameFormValues = z.infer<typeof coloredNameSchema>;

interface ColoredNameFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coloredName: WithId<ReservedName> | null;
  onSave: (data: ColoredNameFormValues) => Promise<void>;
  isResellerPanel?: boolean;
}

export function ColoredNameFormDialog({ isOpen, onClose, coloredName, onSave, isResellerPanel = false }: ColoredNameFormDialogProps) {
  const isEditing = !!coloredName;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<ColoredNameFormValues>({
    resolver: zodResolver(coloredNameSchema),
    defaultValues: isEditing ? {
        ...coloredName,
        password: coloredName.password || '',
        role: coloredName.role || 'visitor',
        cosmeticRank: coloredName.cosmeticRank || null,
    } : {
      name: '',
      color: '#000000',
      reseller: 'Root',
      renewalDate: '',
      password: '',
      role: 'visitor',
      cosmeticRank: null,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? {
            ...coloredName,
            password: coloredName.password || '',
            role: coloredName.role || 'visitor',
            cosmeticRank: coloredName.cosmeticRank || null,
        } : {
            name: '',
            color: '#000000',
            reseller: coloredName?.reseller || 'Root',
            renewalDate: '',
            password: '',
            role: 'visitor',
            cosmeticRank: null,
        });
    }
  }, [isOpen, coloredName, isEditing, form]);

  const handleSubmit = async (values: ColoredNameFormValues) => {
    setIsSubmitting(true);
    await onSave(values);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Colored Name' : 'Add New Colored Name'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this reserved name.' : 'Create a new reserved colored name.'}
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
                    <Input placeholder="VIP_User" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Administrative Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an administrative role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="special">Special</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
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
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Input type="color" className="p-1 h-10 w-14" {...field} />
                            <Input placeholder="#FFD700" {...field} />
                        </div>
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
                    <Input type="password" placeholder="Password to protect name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            {!isResellerPanel && (
                 <FormField
                    control={form.control}
                    name="reseller"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Owner/Reseller</FormLabel>
                        <FormControl>
                        <Input placeholder="Root" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
             <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Renewal Date</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <SubmitButton isSubmitting={isSubmitting}>{isEditing ? 'Save Changes' : 'Add Name'}</SubmitButton>
            </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


interface DeleteColoredNameDialogProps {
    isOpen: boolean;
    onClose: () => void;
    coloredName: WithId<ReservedName> | null;
    onDelete: () => Promise<void>;
}

export function DeleteColoredNameDialog({ isOpen, onClose, coloredName, onDelete }: DeleteColoredNameDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleDelete = async () => {
        if (!coloredName) return;
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
                        This action cannot be undone. This will permanently delete the colored name
                        <span className="font-bold"> "{coloredName?.name}"</span>.
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
