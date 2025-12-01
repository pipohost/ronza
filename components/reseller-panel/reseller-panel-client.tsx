
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition, useCallback } from 'react';
import RoomManagement from "@/components/admin/room-management"
import ColoredNameManagement from "@/components/admin/colored-name-management"
import VisitorLogs from "@/components/admin/visitor-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { LogOut, Home, Edit, Calendar, Megaphone, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Room, Reseller, ReservedName, WithId, VisitorLog, BannedUser } from '@/lib/types';
import type { RoomFormValues } from '@/components/admin/room-dialogs';
import type { ColoredNameFormValues } from '@/components/admin/colored-name-dialogs';
import { addRoomForReseller, updateRoomForReseller, deleteRoomForReseller, addColoredNameForReseller, updateColoredNameForReseller, deleteColoredNameForReseller, clearRoomUsersForReseller, toggleResellerGlobalBan, unbanUserFromReseller } from '@/app/actions/reseller-panel';
import { sendBulkAnnouncement } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';
import { SubmitButton } from '../admin/submit-button';
import ResellerSecurity from '@/components/reseller-panel/reseller-security';

interface ResellerPanelClientProps {
    reseller: WithId<Reseller>;
    initialRooms: WithId<Room>[];
    initialColoredNames: WithId<ReservedName>[];
    initialVisitorLogs: WithId<VisitorLog>[];
    initialBannedUsers: WithId<BannedUser>[];
    signOutAction: () => Promise<void>;
}

function ResellerAnnouncements({ resellerId }: { resellerId: string }) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Announcement cannot be empty.' });
            return;
        }
        setIsSubmitting(true);
        const result = await sendBulkAnnouncement(message, resellerId);
        if (result.success) {
            toast({ title: 'Success', description: 'Announcement sent to all your rooms.' });
            setMessage('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmitting(false);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone /> Send Announcement to All Rooms</CardTitle>
                <CardDescription>Send a broadcast message to all rooms you own.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Textarea 
                    placeholder="Type your announcement here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                />
                <SubmitButton onClick={handleSend} isSubmitting={isSubmitting}>
                    Send Announcement
                </SubmitButton>
            </CardContent>
        </Card>
    )
}

export default function ResellerPanelClient({ reseller, initialRooms, initialColoredNames, initialVisitorLogs, initialBannedUsers, signOutAction }: ResellerPanelClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleAction = useCallback((action: Promise<any>, successMessage: string, errorMessage: string) => {
    startTransition(async () => {
        try {
            await action;
            toast({ title: "Success", description: successMessage });
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || errorMessage });
        }
    });
  }, [router, toast]);

  // --- Room Handlers ---
  const handleAddRoom = useCallback(async (newRoomData: RoomFormValues) => {
     handleAction(addRoomForReseller(reseller.id, newRoomData), 'Room added successfully.', 'Failed to add room.');
  }, [handleAction, reseller.id]);

  const handleUpdateRoom = useCallback(async (roomId: string, updatedData: Partial<Room>) => {
    handleAction(updateRoomForReseller(reseller.id, roomId, updatedData), 'Room updated successfully.', 'Failed to update room.');
  }, [handleAction, reseller.id]);
  
  const handleDeleteRoom = useCallback(async (roomId: string) => {
    handleAction(deleteRoomForReseller(reseller.id, roomId), 'Room deleted successfully.', 'Failed to delete room.');
  }, [handleAction, reseller.id]);

  const handleClearRoomUsers = useCallback(async (roomId: string) => {
    handleAction(clearRoomUsersForReseller(reseller.id, roomId), 'Stuck users cleared successfully.', 'Failed to clear stuck users.');
  }, [handleAction, reseller.id]);

  // --- Colored Name Handlers ---
  const handleAddColoredName = useCallback(async (newColoredNameData: ColoredNameFormValues) => {
    handleAction(addColoredNameForReseller(reseller.id, newColoredNameData), 'Colored name added successfully.', 'Failed to add colored name.');
  }, [handleAction, reseller.id]);

  const handleUpdateColoredName = useCallback(async (nameId: string, updatedData: Partial<ReservedName>) => {
    handleAction(updateColoredNameForReseller(reseller.id, nameId, updatedData), 'Colored name updated successfully.', 'Failed to update colored name.');
  }, [handleAction, reseller.id]);

  const handleDeleteColoredName = useCallback(async (nameId: string) => {
     handleAction(deleteColoredNameForReseller(reseller.id, nameId), 'Colored name deleted successfully.', 'Failed to delete colored name.');
  }, [handleAction, reseller.id]);
  
  const handleToggleBan = useCallback(async (log: VisitorLog, isBanned: boolean) => {
    const action = toggleResellerGlobalBan(log, isBanned);
    const successMessage = `User ${isBanned ? 'unbanned' : 'banned'} from your rooms.`;
    const errorMessage = 'Failed to toggle ban status.';
    handleAction(action, successMessage, errorMessage);
  }, [handleAction]);

  const handleUnban = useCallback(async (banId: string) => {
    const action = unbanUserFromReseller(banId);
    const successMessage = 'User unbanned successfully.';
    const errorMessage = 'Failed to unban user.';
    handleAction(action, successMessage, errorMessage);
  }, [handleAction]);


  if (!isMounted) {
    return null; // Or a loading spinner
  }

  const isLoading = isPending;

  return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Reseller Panel: {reseller.name}</h1>
              <p className="text-muted-foreground">Manage your rooms and reserved names.</p>
          </div>
          <form action={signOutAction}>
            <Button variant="outline" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </form>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialRooms.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reserved Names</CardTitle>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialColoredNames.length}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold">{reseller.status}</div>
                    <p className="text-xs text-muted-foreground">Renews on {reseller.renewalDate}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialBannedUsers.length}</div>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="rooms" className="mt-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-5 md:w-auto">
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="colored_names">Colored Names</TabsTrigger>
            <TabsTrigger value="visitor_logs">Visitor Logs</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomManagement 
                rooms={initialRooms} 
                isLoading={isLoading}
                onAddRoom={handleAddRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onClearRoomUsers={handleClearRoomUsers}
                isResellerPanel={true}
            />
          </TabsContent>
          <TabsContent value="colored_names">
            <ColoredNameManagement 
                coloredNames={initialColoredNames} 
                isLoading={isLoading}
                onAddColoredName={handleAddColoredName}
                onUpdateColoredName={handleUpdateColoredName}
                onDeleteColoredName={handleDeleteColoredName}
                isResellerPanel={true}
            />
          </TabsContent>
          <TabsContent value="visitor_logs">
            <VisitorLogs 
                logs={initialVisitorLogs} 
                isLoading={isLoading} 
                ownerId={reseller.id}
                onToggleBan={handleToggleBan}
            />
          </TabsContent>
          <TabsContent value="security">
            <ResellerSecurity
                bannedUsers={initialBannedUsers}
                isLoading={isLoading}
                onUnban={handleUnban}
            />
          </TabsContent>
          <TabsContent value="announcements">
            <ResellerAnnouncements resellerId={reseller.id} />
          </TabsContent>
        </Tabs>
        <div className="mt-16 text-center text-sm text-muted-foreground">
            Ronza4Chat Version 1.0.0
        </div>
      </div>
    );
}
