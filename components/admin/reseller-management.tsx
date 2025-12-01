'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { ResellerFormDialog, DeleteResellerDialog, type ResellerFormValues } from './reseller-dialogs';
import type { Reseller, WithId } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface ResellerManagementProps {
  resellers: WithId<Reseller>[];
  isLoading: boolean;
  onAddReseller: (data: ResellerFormValues) => Promise<void>;
  onUpdateReseller: (id: string, data: Partial<Reseller>) => Promise<void>;
  onDeleteReseller: (id: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

function ResellerRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
}

export default function ResellerManagement({ resellers, isLoading, onAddReseller, onUpdateReseller, onDeleteReseller }: ResellerManagementProps) {
  const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
  const [dialogData, setDialogData] = React.useState<WithId<Reseller> | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(resellers.length / ITEMS_PER_PAGE);
  const currentResellers = resellers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAddDialog = () => {
    setDialogData(null);
    setDialogOpen('add');
  };
  const openEditDialog = (reseller: WithId<Reseller>) => {
    setDialogData(reseller);
    setDialogOpen('edit');
  };
  const openDeleteDialog = (reseller: WithId<Reseller>) => {
    setDialogData(reseller);
    setDialogOpen('delete');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Resellers</CardTitle>
                <CardDescription>
                Manage all reseller accounts and their privileges.
                </CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add New Reseller</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reseller Name</TableHead>
              <TableHead className="hidden md:table-cell">Rooms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Renewal Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !resellers.length ? (
                Array.from({length: 3}).map((_, i) => <ResellerRowSkeleton key={i} />)
            ) : currentResellers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No resellers found.</TableCell>
                </TableRow>
            ) : (
                currentResellers.map((reseller) => (
              <TableRow key={reseller.id}>
                <TableCell className="font-medium">{reseller.name}</TableCell>
                <TableCell className="hidden md:table-cell">{reseller.rooms}</TableCell>
                <TableCell>
                  <Badge variant={reseller.status === 'Active' ? 'default' : 'destructive'}>{reseller.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{reseller.renewalDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(reseller)}>Edit</DropdownMenuItem>
                       <DropdownMenuItem asChild>
                        <Link href={`/reseller-panel/${reseller.id}`} target="_blank">Reseller Panel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(reseller)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </CardContent>

       <ResellerFormDialog 
          isOpen={dialogOpen === 'add' || dialogOpen === 'edit'}
          onClose={() => setDialogOpen(false)}
          reseller={dialogData}
          onSave={dialogData ? (data) => onUpdateReseller(dialogData.id, data) : onAddReseller}
        />
        
        <DeleteResellerDialog
            isOpen={dialogOpen === 'delete'}
            onClose={() => setDialogOpen(false)}
            reseller={dialogData}
            onDelete={() => {
                if (dialogData) onDeleteReseller(dialogData.id);
                return Promise.resolve();
            }}
        />
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
  )
}
