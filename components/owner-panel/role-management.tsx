
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
  import { MoreHorizontal } from "lucide-react"
  import type { WithId, RegisteredMember } from "@/lib/types"
  import { useToast } from '@/hooks/use-toast';
  import { addRoomMember, updateRoomMember, deleteRoomMember } from '@/app/actions/owner-panel';
  import { MemberFormDialog, DeleteMemberDialog, type MemberFormValues } from './member-dialogs';

  interface OwnerRoleManagementProps {
    roomId: string;
    initialMembers: WithId<RegisteredMember>[];
  }
  
  export default function OwnerRoleManagement({ roomId, initialMembers }: OwnerRoleManagementProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
    const [selectedMember, setSelectedMember] = React.useState<WithId<RegisteredMember> | null>(null);

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
                toast({ title: "Success", description: "Role updated successfully." });
            } else {
                await addRoomMember(roomId, data);
                toast({ title: "Success", description: "Role added successfully." });
            }
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    const performDelete = async () => {
        if (!selectedMember) return;
        try {
            await deleteRoomMember(roomId, selectedMember.id);
            toast({ title: "Success", description: "Role deleted successfully." });
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                    Manage names with specific roles for this room.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="text-right mb-4">
                    <Button onClick={handleAdd}>Add New Role</Button>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Color</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {initialMembers.map(member => (
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
                                <DropdownMenuItem onClick={() => handleEdit(member)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                     {initialMembers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">No roles found.</TableCell>
                        </TableRow>
                     )}
                    </TableBody>
                </Table>
                </CardContent>
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
