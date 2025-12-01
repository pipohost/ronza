
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Room, WithId } from '@/lib/types';

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from './submit-button';
import { Checkbox } from '../ui/checkbox';

const categories = [
    { id: 'european', label: 'غرف أوروبية' },
    { id: 'american', label: 'غرف أمريكية' },
    { id: 'asian', label: 'غرف آسيوية' },
];

const roomFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(1, "Description is required.").max(100, "Description is too long."),
  ownerId: z.string().min(1, "Owner ID is required."),
  maxUsers: z.coerce.number().min(2, 'Must allow at least 2 users.').max(5000, 'Cannot exceed 5000 users.'),
  ownerPanelPassword: z.string().optional(),
  isPublic: z.boolean().default(true),
  renewalDate: z.string().min(1, 'Renewal date is required.'),
  categories: z.array(z.string()).optional(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: WithId<Room> | null;
  onSave: (data: RoomFormValues) => Promise<void>;
  isResellerPanel?: boolean;
}

export function RoomFormDialog({ isOpen, onClose, room, onSave, isResellerPanel = false }: RoomFormDialogProps) {
  const isEditing = !!room;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: isEditing ? {
        ...room,
        ownerPanelPassword: room.ownerPanelPassword || '',
        categories: room.categories || [],
    } : {
      name: '',
      description: '',
      ownerId: 'root',
      maxUsers: 50,
      ownerPanelPassword: '',
      isPublic: !isResellerPanel, // Default to private for resellers
      renewalDate: '',
      categories: [],
    },
  });

  React.useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? {
            ...room,
            ownerPanelPassword: room.ownerPanelPassword || '',
            categories: room.categories || [],
        } : {
            name: '',
            description: '',
            ownerId: room?.ownerId || 'root', // Keep ownerId if editing
            maxUsers: 50,
            ownerPanelPassword: '',
            isPublic: isResellerPanel ? false : (isEditing ? room.isPublic : true),
            renewalDate: '',
            categories: [],
        });
    }
  }, [isOpen, room, isEditing, form, isResellerPanel]);

  const handleSubmit = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    // Ensure reseller rooms are always private
    if (isResellerPanel) {
        values.isPublic = false;
    }
    await onSave(values);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this room.' : 'Create a new chat room.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <Form {...form}>
                <form id="room-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 h-full">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Room Name</FormLabel><FormControl><Input placeholder="Community Hangout" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description of the room" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="maxUsers" render={({ field }) => (
                            <FormItem><FormLabel>Max Visitors</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="renewalDate" render={({ field }) => (
                            <FormItem><FormLabel>Renewal Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="ownerPanelPassword" render={({ field }) => (
                        <FormItem><FormLabel>Owner Panel Password (Optional)</FormLabel><FormControl><Input type="password" placeholder="Password for the owner panel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    {!isResellerPanel && (
                        <>
                             <FormField control={form.control} name="ownerId" render={({ field }) => (
                                <FormItem><FormLabel>Owner ID</FormLabel><FormControl><Input placeholder="root or reseller ID" {...field} /></FormControl><FormDescription>Can be 'root' or a reseller's ID.</FormDescription><FormMessage /></FormItem>
                            )} />
                        </>
                    )}

                    <FormField control={form.control} name="isPublic" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"><FormLabel>Public Room</FormLabel><FormDescription>Visible on the main page. Reseller rooms are always private.</FormDescription></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isResellerPanel} /></FormControl>
                        </FormItem>
                    )} />

                    {!isResellerPanel && (
                        <FormField
                            control={form.control}
                            name="categories"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Room Categories</FormLabel>
                                        <FormDescription>Assign this room to one or more categories.</FormDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                    {categories.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="categories"
                                            render={({ field }) => {
                                                return (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                </form>
            </Form>
        </div>
         <DialogFooter className="pt-4 flex-shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <SubmitButton isSubmitting={isSubmitting} form="room-form" type="submit">
                {isEditing ? 'Save Changes' : 'Create Room'}
            </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface DeleteRoomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    room: WithId<Room> | null;
    onDelete: () => Promise<void>;
}

export function DeleteRoomDialog({ isOpen, onClose, room, onDelete }: DeleteRoomDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleDelete = async () => {
        if (!room) return;

        setIsSubmitting(true);
        await onDelete();
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
                        This action cannot be undone. This will permanently delete the room
                        <span className="font-bold"> "{room?.name}"</span> and all of its messages.
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
