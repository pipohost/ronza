
'use client';

import * as React from "react";
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
  } from "@/components/ui/dropdown-menu";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
  import type { ReservedName, WithId } from "@/lib/types";
  import { ColoredNameFormDialog, DeleteColoredNameDialog, type ColoredNameFormValues } from "./colored-name-dialogs";
  import { Skeleton } from "../ui/skeleton";
  
  interface ColoredNameManagementProps {
    coloredNames: WithId<ReservedName>[];
    isLoading: boolean;
    onAddColoredName: (data: ColoredNameFormValues) => Promise<void>;
    onUpdateColoredName: (id: string, data: Partial<ReservedName>) => Promise<void>;
    onDeleteColoredName: (id: string) => Promise<void>;
    isResellerPanel?: boolean;
  }

  const ITEMS_PER_PAGE = 10;

  function ColoredNameRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    )
  }

  export default function ColoredNameManagement({ coloredNames, isLoading, onAddColoredName, onUpdateColoredName, onDeleteColoredName, isResellerPanel = false }: ColoredNameManagementProps) {
    const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
    const [dialogData, setDialogData] = React.useState<WithId<ReservedName> | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);

    const totalPages = Math.ceil(coloredNames.length / ITEMS_PER_PAGE);
    const currentColoredNames = coloredNames.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openAddDialog = () => {
      setDialogData(null);
      setDialogOpen('add');
    };
    const openEditDialog = (name: WithId<ReservedName>) => {
      setDialogData(name);
      setDialogOpen('edit');
    };
    const openDeleteDialog = (name: WithId<ReservedName>) => {
      setDialogData(name);
      setDialogOpen('delete');
    };
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle>Colored Names</CardTitle>
                <CardDescription>
                Manage reserved colored usernames for visitors across the network.
                </CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add New Colored Name</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead className="hidden md:table-cell">Owner/Reseller</TableHead>
                <TableHead className="hidden md:table-cell">Renewal Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !coloredNames.length ? (
                Array.from({length: 3}).map((_, i) => <ColoredNameRowSkeleton key={i} />)
              ) : currentColoredNames.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No colored names found.</TableCell>
                </TableRow>
              ) : (
                currentColoredNames.map((name) => (
                <TableRow key={name.id}>
                  <TableCell className="font-medium">{name.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: name.color }}></div>
                        <span>{name.color}</span>
                    </div>
                  </TableCell>
                   <TableCell>
                      <Badge variant="outline">{name.cosmeticRank ? name.cosmeticRank.replace(/_/g, ' ') : 'N/A'}</Badge>
                    </TableCell>
                  <TableCell className="hidden md:table-cell">{name.reseller}</TableCell>
                  <TableCell className="hidden md:table-cell">{name.renewalDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(name)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(name)} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>

        <ColoredNameFormDialog 
          isOpen={dialogOpen === 'add' || dialogOpen === 'edit'}
          onClose={() => setDialogOpen(false)}
          coloredName={dialogData}
          onSave={dialogData ? (data) => onUpdateColoredName(dialogData.id, data) : onAddColoredName}
          isResellerPanel={isResellerPanel}
        />
        
        <DeleteColoredNameDialog
            isOpen={dialogOpen === 'delete'}
            onClose={() => setDialogOpen(false)}
            coloredName={dialogData}
            onDelete={() => {
                if(dialogData) onDeleteColoredName(dialogData.id)
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
