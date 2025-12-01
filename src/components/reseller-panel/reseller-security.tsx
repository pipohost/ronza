'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { WithId, BannedUser } from "@/lib/types";
import { SubmitButton } from '../admin/submit-button';

interface ResellerSecurityProps {
  bannedUsers: WithId<BannedUser>[];
  isLoading: boolean;
  onUnban: (banId: string) => Promise<void>;
}

export default function ResellerSecurity({ bannedUsers, isLoading, onUnban }: ResellerSecurityProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState<string | false>(false);

  const handleUnban = async (banId: string) => {
    setIsSubmitting(banId);
    try {
      await onUnban(banId);
      // Success toast is handled by parent
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to unban user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banned Users Management</CardTitle>
        <CardDescription>
          Manage users who are globally banned from all of your rooms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : bannedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">No banned users found.</TableCell>
              </TableRow>
            ) : (
              bannedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.reason}</TableCell>
                  <TableCell className="text-right">
                    <SubmitButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnban(user.id)}
                      isSubmitting={isSubmitting === user.id}
                    >
                      Unban
                    </SubmitButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
