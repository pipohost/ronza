'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Shield, Eye, Mic, Palette, RefreshCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Room, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateRoomSettings, updatePanelPassword } from '@/app/actions/owner-panel';
import { SubmitButton } from '../admin/submit-button';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

// Schemas for different forms
const generalSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  welcomeMessage: z.string().min(1, "Welcome message is required.").max(150, "Message is too long."),
  icon: z.string(),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

const accessControlSchema = z.object({
    isLocked: z.boolean(),
    isPrivateChatEnabled: z.boolean(),
    showJoinLeaveMessages: z.boolean(),
});

const visitorControlSchema = z.object({
    muteVisitorsVoice: z.boolean(),
    muteVisitorsText: z.boolean(),
});


type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type AccessControlValues = z.infer<typeof accessControlSchema>;
type VisitorControlValues = z.infer<typeof visitorControlSchema>;

interface OwnerRoomSettingsProps {
    room: WithId<Room>;
}

const iconList = ['MessageSquare', 'Heart', 'Star', 'Users', 'Briefcase', 'Music', 'Code', 'Gamepad2', 'Film'];

const gradientClasses = [
    'bg-gradient-to-r from-green-300 to-purple-400',
    'bg-gradient-to-r from-pink-500 to-yellow-500',
    'bg-gradient-to-r from-blue-400 to-indigo-500',
    'bg-gradient-to-r from-red-500 to-orange-500',
    'bg-gradient-to-r from-teal-400 to-cyan-600',
    'bg-gradient-to-r from-gray-700 to-gray-900',
    'bg-gradient-to-r from-rose-400 to-red-500',
    'bg-gradient-to-r from-lime-400 to-green-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-slate-900 to-slate-700',
    'bg-gradient-to-br from-red-900 to-red-600',
    'bg-gradient-to-br from-blue-800 to-indigo-900',
    'bg-gradient-to-br from-purple-600 to-blue-500',
    'bg-gradient-to-br from-green-500 to-cyan-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-gray-400 to-gray-600',
    'bg-gradient-to-br from-indigo-500 to-fuchsia-500',
    'bg-gradient-to-br from-cyan-400 to-light-blue-500',
];

export default function OwnerRoomSettings({ room }: OwnerRoomSettingsProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const texts = t.ownerPanel.settings;
    const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);

    const generalSettingsForm = useForm<GeneralSettingsValues>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: { name: room.name, welcomeMessage: room.welcomeMessage, icon: room.icon || 'MessageSquare' },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '' }
    });
    
    const accessControlForm = useForm<AccessControlValues>({
        resolver: zodResolver(accessControlSchema),
        defaultValues: { isLocked: room.isLocked, isPrivateChatEnabled: room.isPrivateChatEnabled, showJoinLeaveMessages: room.showJoinLeaveMessages },
    });
    
    const visitorControlForm = useForm<VisitorControlValues>({
        resolver: zodResolver(visitorControlSchema),
        defaultValues: { muteVisitorsVoice: room.muteVisitorsVoice, muteVisitorsText: room.muteVisitorsText },
    });

    const handleFormSubmit = async (formName: string, values: Partial<Room>) => {
        setIsSubmitting(formName);
        try {
            await updateRoomSettings(room.id, values);
            toast({ title: texts.success, description: texts.updateSuccess });
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message || texts.updateError });
        }
        setIsSubmitting(null);
    };

    const handlePasswordSubmit = async (values: PasswordFormValues) => {
        setIsSubmitting('password');
        try {
            if (values.newPassword) {
                 await updatePanelPassword(room.id, values.newPassword);
                 toast({ title: texts.success, description: texts.passwordUpdateSuccess });
                 passwordForm.reset();
            } else {
                throw new Error("Password cannot be empty.");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message || texts.passwordUpdateError });
        }
        setIsSubmitting(null);
    }
    
    const renderIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName];
        return IconComponent ? <IconComponent className="w-4 h-4 mr-2" /> : null;
    }
    
    const handleBackgroundChange = (gradientClass: string | null) => {
        handleFormSubmit('background', { backgroundGradient: gradientClass || '' });
    };

    return (
        <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* General Settings Card */}
                <Form {...generalSettingsForm}>
                    <form onSubmit={generalSettingsForm.handleSubmit(data => handleFormSubmit('general', data))} className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>{texts.general.title}</CardTitle><CardDescription>{texts.general.description}</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={generalSettingsForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{texts.general.nameLabel}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={generalSettingsForm.control} name="welcomeMessage" render={({ field }) => (<FormItem><FormLabel>{texts.general.welcomeMessageLabel}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={generalSettingsForm.control} name="icon" render={({ field }) => (<FormItem><FormLabel>{texts.general.iconLabel}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><div className="flex items-center">{renderIcon(field.value)}<SelectValue placeholder={texts.general.iconPlaceholder} /></div></SelectTrigger></FormControl><SelectContent>{iconList.map(iconName => (<SelectItem key={iconName} value={iconName}><div className="flex items-center">{renderIcon(iconName)}<span>{iconName}</span></div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            </CardContent>
                            <CardContent>
                                <SubmitButton isSubmitting={isSubmitting === 'general'} className="w-full">{texts.general.saveButton}</SubmitButton>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
           
                {/* Panel Security Form */}
                <div className="space-y-6">
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />{texts.security.title}</CardTitle><CardDescription>{texts.security.description}</CardDescription></CardHeader>
                                <CardContent><FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>{texts.security.passwordLabel}</FormLabel><FormControl><Input type="password" placeholder={texts.security.passwordPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)} /></CardContent>
                                <CardContent><SubmitButton isSubmitting={isSubmitting === 'password'}>{texts.security.saveButton}</SubmitButton></CardContent>
                            </Card>
                        </form>
                    </Form>

                    <Card>
                        <CardHeader><CardTitle>{texts.subscription.title}</CardTitle><CardDescription>{texts.subscription.description}</CardDescription></CardHeader>
                        <CardContent><Input value={room.renewalDate} readOnly disabled /></CardContent>
                    </Card>
                </div>
            </div>
            
            {/* Background Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary"/>{texts.background.title}</CardTitle>
                    <CardDescription>{texts.background.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {gradientClasses.map((gradient) => (
                            <button
                                key={gradient}
                                onClick={() => handleBackgroundChange(gradient)}
                                className={cn("w-full aspect-square rounded-full cursor-pointer border-2 transition-all", gradient, room.backgroundGradient === gradient ? 'border-primary ring-2 ring-primary' : 'border-transparent')}
                                aria-label={`${texts.background.selectAria} ${gradient}`}
                            />
                        ))}
                    </div>
                </CardContent>
                 <CardContent>
                    <SubmitButton 
                        onClick={() => handleBackgroundChange(null)}
                        isSubmitting={isSubmitting === 'background_reset'}
                        variant="outline"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4"/>
                        {texts.background.resetButton}
                    </SubmitButton>
                </CardContent>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Access Control */}
                <Form {...accessControlForm}>
                    <form onSubmit={accessControlForm.handleSubmit(data => handleFormSubmit('access', data))}>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />{texts.access.title}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={accessControlForm.control} name="isLocked" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel>{texts.access.lockRoom}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={accessControlForm.control} name="isPrivateChatEnabled" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel>{texts.access.enablePrivateChat}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={accessControlForm.control} name="showJoinLeaveMessages" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel>{texts.access.showJoinLeave}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </CardContent>
                             <CardContent>
                                <SubmitButton isSubmitting={isSubmitting === 'access'}>{texts.access.saveButton}</SubmitButton>
                            </CardContent>
                        </Card>
                    </form>
                </Form>

                {/* Visitor Control */}
                <Form {...visitorControlForm}>
                    <form onSubmit={visitorControlForm.handleSubmit(data => handleFormSubmit('visitor', data))}>
                        <Card>
                             <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5 text-primary" />{texts.visitor.title}</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <FormField control={visitorControlForm.control} name="muteVisitorsVoice" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel>{texts.visitor.muteVoice}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={visitorControlForm.control} name="muteVisitorsText" render={({ field }) => (<FormItem className="flex items-center justify-between"><FormLabel>{texts.visitor.muteText}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </CardContent>
                             <CardContent>
                                <SubmitButton isSubmitting={isSubmitting === 'visitor'}>{texts.visitor.saveButton}</SubmitButton>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
             </div>
        </div>
    );
}
