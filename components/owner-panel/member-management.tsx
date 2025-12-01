'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
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
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react"
  import type { WithId, RegisteredMember } from "@/lib/types"
  import { useToast } from '@/hooks/use-toast';
  import { addRoomMember, updateRoomMember, deleteRoomMember } from '@/app/actions/owner-panel';
  import { MemberFormDialog, DeleteMemberDialog, type MemberFormValues } from './member-dialogs';
  import { useTranslation } from '@/hooks/use-translation';

  interface OwnerMemberManagementProps {
    roomId: string;
    initialMembers: WithId<RegisteredMember>[];
  }
  
  const ITEMS_PER_PAGE = 10;
  
  export default function OwnerMemberManagement({ roomId, initialMembers }: OwnerMemberManagementProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
    const [selectedMember, setSelectedMember] = React.useState<WithId<RegisteredMember> | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const { t } = useTranslation();
    const texts = t.ownerPanel.memberManagement;


    const totalPages = Math.ceil(initialMembers.length / ITEMS_PER_PAGE);
    const currentMembers = initialMembers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleAdd = () => {
        setSelectedMember(null);
        setDialogOpen('form');
    }

    const handleEdit = (member: WithId<RegisteredMember>) => {
        setSelectedMember(member);
        setDialogOpen('form');
    }

    const handleDelete = (member: WithId<RegisteredMember>) => {
        setSelectedMember(member);
        setDialogOpen('delete');
    }

    const handleSave = async (data: MemberFormValues) => {
        try {
            if (selectedMember) {
                await updateRoomMember(roomId, selectedMember.id, data);
                toast({ title: texts.success, description: texts.updateSuccess });
            } else {
                await addRoomMember(roomId, data);
                toast({ title: texts.success, description: texts.addSuccess });
            }
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        }
    }

    const performDelete = async () => {
        if (!selectedMember) return;
        try {
            await deleteRoomMember(roomId, selectedMember.id);
            toast({ title: texts.success, description: texts.deleteSuccess });
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                <CardTitle>{texts.title}</CardTitle>
                <CardDescription>
                    {texts.description}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="text-right mb-4">
                    <Button onClick={handleAdd}>{texts.addButton}</Button>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>{texts.columns.name}</TableHead>
                        <TableHead>{texts.columns.role}</TableHead>
                        <TableHead className="hidden md:table-cell">{texts.columns.color}</TableHead>
                        <TableHead>
                        <span className="sr-only">{texts.columns.actions}</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {currentMembers.map(member => (
                        <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                            <Badge variant={member.role === 'admin' || member.role === 'superadmin' ? 'default' : 'secondary'}>{member.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: member.color }}></div>
                                {member.color}
                            </div>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(member)}>{texts.actions.edit}</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member)}>{texts.actions.delete}</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                     {currentMembers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">{texts.noMembers}</TableCell>
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

            <MemberFormDialog
                isOpen={dialogOpen === 'form'}
                onClose={() => setDialogOpen(false)}
                member={selectedMember}
                onSave={handleSave}
            />
            <DeleteMemberDialog
                isOpen={dialogOpen === 'delete'}
                onClose={() => setDialogOpen(false)}
                member={selectedMember}
                onDelete={performDelete}
            />
      </>
    )
  }
