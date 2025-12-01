
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition, useCallback } from 'react';
import StatsCards from "@/components/admin/stats"
import RoomManagement from "@/components/admin/room-management"
import ResellerManagement from "@/components/admin/reseller-management"
import ColoredNameManagement from "@/components/admin/colored-name-management"
import JournalManagement from "@/components/admin/journal-management"
import VisitorLogs from "@/components/admin/visitor-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Megaphone, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Room, Reseller, ReservedName, WithId, Post, VisitorLog } from '@/lib/types';
import type { RoomFormValues } from '@/components/admin/room-dialogs';
import type { ResellerFormValues } from '@/components/admin/reseller-dialogs';
import type { ColoredNameFormValues } from '@/components/admin/colored-name-dialogs';
import { addRoom, updateRoom, deleteRoom } from '@/app/actions/rooms';
import { addReseller, updateReseller, deleteReseller } from '@/app/actions/resellers';
import { addColoredName, updateColoredName, deleteColoredName } from '@/app/actions/reserved-names';
import { addPost, updatePost, deletePost } from '@/app/actions/journal';
import { clearRoomUsers } from '@/app/actions/clear-room';
import { signOutAdminAction, sendBulkAnnouncement, toggleGlobalBan } from '@/app/actions/admin';
import { z } from 'zod';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { SubmitButton } from './submit-button';
import { useTranslation } from '@/hooks/use-translation';

interface AdminPageClientProps {
    initialRooms: WithId<Room>[];
    initialResellers: WithId<Reseller>[];
    initialColoredNames: WithId<ReservedName>[];
    initialUsers: any[];
    initialPosts: WithId<Post>[];
    initialVisitorLogs: WithId<VisitorLog>[];
}

function AdminPageSkeleton() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-72 mt-2" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            
            <div className="mt-8">
                <Skeleton className="h-10 w-[400px]" />
                <Skeleton className="h-[400px] w-full mt-4" />
            </div>
        </div>
    );
}

function GlobalAnnouncements() {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Announcement cannot be empty.' });
            return;
        }
        setIsSubmitting(true);
        const result = await sendBulkAnnouncement(message, 'root');
        if (result.success) {
            toast({ title: 'Success', description: 'Announcement sent to all root rooms.' });
            setMessage('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmitting(false);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone /> Global Announcements (Root)</CardTitle>
                <CardDescription>Send a message to all rooms owned by 'root'. This will appear as a special announcement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Textarea 
                    placeholder="Type your global announcement here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                />
                <SubmitButton onClick={handleSend} isSubmitting={isSubmitting}>
                    Send to All Root Rooms
                </SubmitButton>
            </CardContent>
        </Card>
    )
}

export default function AdminPageClient({ initialRooms, initialResellers, initialColoredNames, initialUsers, initialPosts, initialVisitorLogs }: AdminPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { t, toggleLanguage, lang, dir } = useTranslation();

  const [rooms, setRooms] = useState(initialRooms);
  const [resellers, setResellers] = useState(initialResellers);
  const [coloredNames, setColoredNames] = useState(initialColoredNames);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    setResellers(initialResellers);
  }, [initialResellers]);

  useEffect(() => {
    setColoredNames(initialColoredNames);
  }, [initialColoredNames]);

  const adminData = {
      users: initialUsers,
      rooms: rooms,
      resellers: resellers,
      reservedNames: coloredNames,
  };

  const handleSignOut = async () => {
    startTransition(async () => {
        await signOutAdminAction();
        toast({
            title: 'Signed Out',
            description: 'You have been successfully signed out.',
        });
        router.replace('/admin/login');
    });
  };
  
  const handleAction = useCallback((action: Promise<any>, successMessage: string, errorMessage: string, refresh: boolean = true) => {
    startTransition(async () => {
        try {
            const result = await action;
            if (result && result.error) {
              throw new Error(result.error);
            }
            toast({ title: "Success", description: successMessage });
            if (refresh) {
                router.refresh();
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || errorMessage });
        }
    });
  }, [router, toast]);

  // --- Room Handlers ---
  const handleAddRoom = useCallback(async (newRoomData: RoomFormValues) => {
     handleAction(addRoom(newRoomData), 'Room added successfully.', 'Failed to add room.');
  }, [handleAction]);

  const handleUpdateRoom = useCallback(async (roomId: string, updatedData: Partial<Room>) => {
    handleAction(updateRoom(roomId, updatedData), 'Room updated successfully.', 'Failed to update room.');
  }, [handleAction]);
  
  const handleDeleteRoom = useCallback(async (roomId: string) => {
    handleAction(deleteRoom(roomId), 'Room deleted successfully.', 'Failed to delete room.');
  }, [handleAction]);

  const handleClearRoomUsers = useCallback(async (roomId: string) => {
    handleAction(clearRoomUsers(roomId), 'Stuck users cleared successfully.', 'Failed to clear stuck users.');
  }, [handleAction]);

  // --- Reseller Handlers ---
  const handleAddReseller = useCallback(async (newResellerData: ResellerFormValues) => {
     handleAction(addReseller(newResellerData), 'Reseller added successfully.', 'Failed to add reseller.');
  }, [handleAction]);

  const handleUpdateReseller = useCallback(async (resellerId: string, updatedData: Partial<Reseller>) => {
     handleAction(updateReseller(resellerId, updatedData), 'Reseller updated successfully.', 'Failed to update reseller.');
  }, [handleAction]);

  const handleDeleteReseller = useCallback(async (resellerId: string) => {
     handleAction(deleteReseller(resellerId), 'Reseller deleted successfully.', 'Failed to delete reseller.');
  }, [handleAction]);

  // --- Colored Name Handlers ---
  const handleAddColoredName = useCallback(async (newColoredNameData: ColoredNameFormValues) => {
    handleAction(addColoredName(newColoredNameData), 'Colored name added successfully.', 'Failed to add colored name.');
  }, [handleAction]);

  const handleUpdateColoredName = useCallback(async (nameId: string, updatedData: Partial<ReservedName>) => {
    handleAction(updateColoredName(nameId, updatedData), 'Colored name updated successfully.', 'Failed to update colored name.');
  }, [handleAction]);

  const handleDeleteColoredName = useCallback(async (nameId: string) => {
     handleAction(deleteColoredName(nameId), 'Colored name deleted successfully.', 'Failed to delete colored name.');
  }, [handleAction]);
  
  // --- Journal Post Handlers ---
  const handleAddPost = useCallback(async (data: z.infer<any>) => {
    handleAction(addPost(data), 'Post created successfully.', 'Failed to create post.');
  }, [handleAction]);

  const handleUpdatePost = useCallback(async (postId: string, data: z.infer<any>) => {
    handleAction(updatePost(postId, data), 'Post updated successfully.', 'Failed to update post.');
  }, [handleAction]);

  const handleDeletePost = useCallback(async (postId: string) => {
    handleAction(deletePost(postId), 'Post deleted successfully.', 'Failed to delete post.');
  }, [handleAction]);

  const handleToggleGlobalBan = useCallback(async (userLog: VisitorLog, isCurrentlyBanned: boolean) => {
    const successMessage = `User ${isCurrentlyBanned ? 'unbanned' : 'banned'} successfully.`;
    handleAction(toggleGlobalBan(userLog, isCurrentlyBanned), successMessage, 'Failed to toggle global ban.');
  }, [handleAction]);


  if (isLoading) {
    return <AdminPageSkeleton />;
  }

  const isActionPending = isPending;

  return (
      <div className="container mx-auto py-10" dir={dir}>
        <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.adminPanel.root.title}</h1>
              <p className="text-muted-foreground">{t.adminPanel.root.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleLanguage}>
                <Languages className="mr-2 h-4 w-4" />
                {lang === 'ar' ? 'English' : 'العربية'}
            </Button>
            <Button variant="outline" onClick={handleSignOut} disabled={isActionPending}>
                {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <LogOut className="mr-2 h-4 w-4" />
                {t.adminPanel.signOut}
            </Button>
          </div>
        </div>
        
        <StatsCards data={adminData} isLoading={isActionPending} />
        
        <Tabs defaultValue="rooms" className="mt-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-6 md:w-auto">
            <TabsTrigger value="rooms">{t.adminPanel.tabs.roomManagement}</TabsTrigger>
            <TabsTrigger value="resellers">{t.adminPanel.tabs.resellerManagement}</TabsTrigger>
            <TabsTrigger value="colored_names">{t.adminPanel.tabs.coloredNames}</TabsTrigger>
            <TabsTrigger value="journal">{t.adminPanel.tabs.journal}</TabsTrigger>
            <TabsTrigger value="visitor_logs">{t.adminPanel.tabs.visitorLogs}</TabsTrigger>
            <TabsTrigger value="announcements">{t.adminPanel.tabs.announcements}</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomManagement 
                rooms={rooms} 
                isLoading={isActionPending}
                onAddRoom={handleAddRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onClearRoomUsers={handleClearRoomUsers}
            />
          </TabsContent>
          <TabsContent value="resellers">
            <ResellerManagement 
                resellers={resellers} 
                isLoading={isActionPending}
                onAddReseller={handleAddReseller}
                onUpdateReseller={handleUpdateReseller}
                onDeleteReseller={handleDeleteReseller}
            />
          </TabsContent>
          <TabsContent value="colored_names">
            <ColoredNameManagement 
                coloredNames={coloredNames} 
                isLoading={isActionPending}
                onAddColoredName={handleAddColoredName}
                onUpdateColoredName={handleUpdateColoredName}
                onDeleteColoredName={handleDeleteColoredName}
            />
          </TabsContent>
           <TabsContent value="journal">
            <JournalManagement
                posts={initialPosts}
                isLoading={isActionPending}
                onAddPost={handleAddPost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
            />
          </TabsContent>
          <TabsContent value="visitor_logs">
            <VisitorLogs 
                logs={initialVisitorLogs} 
                onToggleBan={handleToggleGlobalBan} 
            />
          </TabsContent>
           <TabsContent value="announcements">
            <GlobalAnnouncements />
          </TabsContent>
        </Tabs>
        <div className="mt-16 text-center text-sm text-muted-foreground">
            Ronza4Chat Version 1.0.0
        </div>
      </div>
    );
}
