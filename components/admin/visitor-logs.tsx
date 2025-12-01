'use client';

import * as React from 'react';
import type { VisitorLog, WithId } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Trash2, ShieldBan, ShieldCheck, MapPin } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import * as LucideIcons from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { clearVisitorLogs, toggleGlobalBan } from '@/app/actions/admin';
import { SubmitButton } from './submit-button';
import { getGlobalBans } from '@/lib/server-data';


interface VisitorLogsProps {
    logs: WithId<VisitorLog>[];
    isLoading?: boolean;
    ownerId?: string; // To specify which logs to clear (for resellers)
    onToggleBan?: (log: VisitorLog, isBanned: boolean) => Promise<void>;
}

const LOGS_PER_PAGE = 10;

function LogRowSkeleton() {
    return (
        <TableRow>
            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
    );
}

const UserAvatar = ({ avatarUrl, name }: { avatarUrl: string; name: string }) => {
    const IconComponent = (LucideIcons as any)[avatarUrl];
  
    if (IconComponent) {
      return (
        <Avatar>
          <AvatarFallback className="bg-secondary">
            <IconComponent className="h-6 w-6 text-primary" />
          </AvatarFallback>
        </Avatar>
      );
    }
  
    return (
      <Avatar>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
    );
};

export default function VisitorLogs({ logs, isLoading = false, ownerId, onToggleBan }: VisitorLogsProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isClient, setIsClient] = React.useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean | string>(false);
    const [globalBans, setGlobalBans] = React.useState<string[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        setIsClient(true);
        if (!ownerId) { // Only fetch global bans in root admin panel
            const fetchBans = async () => {
                const bans = await getGlobalBans();
                setGlobalBans(bans.map(b => b.id));
            };
            fetchBans();
        }
    }, [ownerId]);

    const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);
    const currentLogs = logs.slice(
        (currentPage - 1) * LOGS_PER_PAGE,
        currentPage * LOGS_PER_PAGE
    );

    const handleClearLogs = async () => {
        setIsSubmitting(true);
        try {
            await clearVisitorLogs(ownerId);
            toast({ title: 'Success', description: 'Visitor logs have been cleared.' });
            setIsClearDialogOpen(false);
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to clear logs.' });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleBanToggle = async (log: VisitorLog, isBanned: boolean) => {
        if (!onToggleBan) return;
        setIsSubmitting(log.id);
        try {
            await onToggleBan(log, isBanned);
            // The parent component will handle the success toast and state update
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to toggle ban status.' });
        } finally {
             setIsSubmitting(false);
        }
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Visitor Logs</CardTitle>
                            <CardDescription>A real-time log of users joining rooms.</CardDescription>
                        </div>
                        <Button variant="destructive" onClick={() => setIsClearDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All Logs
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead className="hidden md:table-cell">IP Address</TableHead>
                                <TableHead className="hidden lg:table-cell">Location</TableHead>
                                <TableHead className="hidden md:table-cell">Time</TableHead>
                                {!ownerId && <TableHead className="hidden md:table-cell">Owner ID</TableHead>}
                                {onToggleBan && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <LogRowSkeleton key={i} />)
                            ) : currentLogs.length > 0 ? (
                                currentLogs.map((log) => {
                                    const isBanned = globalBans.includes(log.userId);
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar avatarUrl={log.userAvatar} name={log.userName} />
                                                    <span className="font-medium">{log.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{log.roomName}</TableCell>
                                            <TableCell className="hidden md:table-cell font-mono text-xs">{log.ipAddress || 'N/A'}</TableCell>
                                            <TableCell className="hidden lg:table-cell text-xs">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {log.city && log.city !== 'N/A' ? `${log.city}, ${log.country}` : log.country || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {isClient ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ar }) : '...'}
                                            </TableCell>
                                            {!ownerId && <TableCell className="hidden md:table-cell font-mono text-xs">{log.ownerId}</TableCell>}
                                            {onToggleBan && (
                                                <TableCell>
                                                    <SubmitButton
                                                        variant={isBanned ? "secondary" : "destructive"}
                                                        size="sm"
                                                        onClick={() => handleBanToggle(log, isBanned)}
                                                        isSubmitting={isSubmitting === log.id}
                                                    >
                                                        {isBanned ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldBan className="mr-2 h-4 w-4" />}
                                                        {isBanned ? 'Unban' : 'Global Ban'}
                                                    </SubmitButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={ownerId ? 6 : 7} className="h-24 text-center">No visitor logs found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 {totalPages > 1 && (
                    <CardFooter>
                        <div className="flex justify-center items-center gap-2 w-full text-xs text-muted-foreground">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all visitor logs {ownerId ? "for your rooms" : ""}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button type="button" variant="ghost" disabled={isSubmitting === true}>Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                           <SubmitButton variant="destructive" onClick={handleClearLogs} isSubmitting={isSubmitting === true}>
                                Yes, delete logs
                           </SubmitButton>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
