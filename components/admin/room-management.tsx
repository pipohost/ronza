'use client';

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Code, ExternalLink, Users, Trash2, ArrowLeft, ArrowRight, Save } from "lucide-react";
import type { Room, WithId } from '@/lib/types';
import { RoomFormDialog, DeleteRoomDialog, type RoomFormValues } from "./room-dialogs";
import { Skeleton } from "../ui/skeleton";
import { EmbedDialog } from "./embed-dialog";
import { ClearRoomUsersDialog } from './clear-room-dialog';
import { useToast } from "@/hooks/use-toast";

interface RoomManagementProps {
  rooms: WithId<Room>[];
  isLoading: boolean;
  onAddRoom: (data: RoomFormValues) => Promise<void>;
  onUpdateRoom: (id: string, data: Partial<Room>) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onClearRoomUsers: (id: string) => Promise<void>;
  isResellerPanel?: boolean;
}

const ITEMS_PER_PAGE = 10;

function RoomRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}

export default function RoomManagement({ rooms, isLoading, onAddRoom, onUpdateRoom, onDeleteRoom, onClearRoomUsers, isResellerPanel = false }: RoomManagementProps) {
  const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
  const [dialogData, setDialogData] = React.useState<WithId<Room> | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const currentRooms = rooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAddDialog = () => {
    setDialogData(null);
    setDialogOpen('add');
  };
  const openEditDialog = (room: WithId<Room>) => {
    setDialogData(room);
    setDialogOpen('edit');
  };
  const openDeleteDialog = (room: WithId<Room>) => {
    setDialogData(room);
    setDialogOpen('delete');
  };
  const openEmbedDialog = (room: WithId<Room>) => {
    setDialogData(room);
    setDialogOpen('embed');
  }
  const openClearUsersDialog = (room: WithId<Room>) => {
    setDialogData(room);
    setDialogOpen('clear-users');
  };

  const handleOpenRoom = (roomId: string) => {
    const width = 1100;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open(`/chat-room/${roomId}`, `_blank`, `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{isResellerPanel ? 'Your Rooms' : 'Root Rooms'}</CardTitle>
                <CardDescription>
                {isResellerPanel ? 'Manage the rooms you have created.' : 'Manage all rooms created by the Root administrator.'}
                </CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add New Room</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead className="hidden md:table-cell">Users</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Owner ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !rooms.length ? (
                Array.from({length: 3}).map((_, i) => <RoomRowSkeleton key={i} />)
            ) : currentRooms.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No rooms found.</TableCell>
                </TableRow>
            ) : (
                currentRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.userCount || 0} / {room.maxUsers}
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Badge variant={room.isPublic ? 'default' : 'secondary'}>{room.isPublic ? 'Public' : 'Private'}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{room.ownerId}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(room)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenRoom(room.id)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Room
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <Link href={`/owner-panel/${room.id}`} target="_blank">Owner Panel</Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => openClearUsersDialog(room)}>
                         <Trash2 className="mr-2 h-4 w-4" />
                        Clear Stuck Users
                      </DropdownMenuItem>
                      {!isResellerPanel && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEmbedDialog(room)}>
                                <Code className="mr-2 h-4 w-4" />
                                Embed
                            </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(room)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
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

      <RoomFormDialog
        isOpen={dialogOpen === 'add' || dialogOpen === 'edit'}
        onClose={() => setDialogOpen(false)}
        room={dialogData}
        onSave={dialogData ? (data) => onUpdateRoom(dialogData.id, data) : onAddRoom}
        isResellerPanel={isResellerPanel}
        />

      <DeleteRoomDialog
        isOpen={dialogOpen === 'delete'}
        onClose={() => setDialogOpen(false)}
        room={dialogData}
        onDelete={() => {
            if(dialogData) onDeleteRoom(dialogData.id)
            return Promise.resolve();
        }}
    />

    <ClearRoomUsersDialog
        isOpen={dialogOpen === 'clear-users'}
        onClose={() => setDialogOpen(false)}
        room={dialogData}
        onConfirm={() => {
            if(dialogData) onClearRoomUsers(dialogData.id)
            return Promise.resolve();
        }}
    />
    
    <EmbedDialog
      isOpen={dialogOpen === 'embed'}
      onClose={() => setDialogOpen(false)}
      room={dialogData}
    />
    </>
  )
}
