'use client';
import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Button } from "@/components/ui/button"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import type { WithId, BannedUser } from "@/lib/types";
  import { useToast } from "@/hooks/use-toast";
  import { unbanUser } from "@/app/actions/owner-panel";
  import { SubmitButton } from '../admin/submit-button';
  import { ArrowLeft, ArrowRight } from 'lucide-react';
  import { useTranslation } from '@/hooks/use-translation';
  
  interface OwnerSecurityProps {
      roomId: string;
      initialBannedUsers: WithId<BannedUser>[];
      initialActivityLog: string[];
  }

  const ITEMS_PER_PAGE = 5;

  export default function OwnerSecurity({ roomId, initialBannedUsers, initialActivityLog }: OwnerSecurityProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const { t } = useTranslation();
    const texts = t.ownerPanel.security;

    const totalPages = Math.ceil(initialBannedUsers.length / ITEMS_PER_PAGE);
    const currentBannedUsers = initialBannedUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleUnban = async (userId: string) => {
        setIsSubmitting(userId);
        try {
            await unbanUser(roomId, userId);
            toast({ title: texts.success, description: texts.unbanSuccess });
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        } finally {
            setIsSubmitting(null);
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 mt-4">
            <Card>
                <CardHeader>
                <CardTitle>{texts.bannedUsers.title}</CardTitle>
                <CardDescription>
                    {texts.bannedUsers.description}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>{texts.bannedUsers.columns.user}</TableHead>
                        <TableHead>{texts.bannedUsers.columns.reason}</TableHead>
                        <TableHead>{texts.bannedUsers.columns.action}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {currentBannedUsers.map(user => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.reason}</TableCell>
                        <TableCell>
                            <SubmitButton 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleUnban(user.id)}
                                isSubmitting={isSubmitting === user.id}
                            >
                                {texts.bannedUsers.unbanButton}
                            </SubmitButton>
                        </TableCell>
                        </TableRow>
                    ))}
                     {initialBannedUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">{texts.bannedUsers.noBanned}</TableCell>
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
                                {texts.pagination.page} {currentPage} {texts.pagination.of} {totalPages}
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
            <Card>
                <CardHeader>
                    <CardTitle>{texts.activityLog.title}</CardTitle>
                    <CardDescription>
                        {texts.activityLog.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <div className="space-y-2">
                            {initialActivityLog.length > 0 ? (
                                initialActivityLog.slice().reverse().map((log, index) => (
                                    <p key={index} className="text-sm text-muted-foreground">{log}</p>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">{texts.activityLog.noActivity}</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
  }
