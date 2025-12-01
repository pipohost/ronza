'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { addReservedNameToRoom, removeReservedNameFromRoom } from '@/app/actions/owner-panel';
import { SubmitButton } from '../admin/submit-button';


interface ReservedNamesProps {
    roomId: string;
    initialReservedNames: string[];
    texts: {
        title: string;
        description: string;
        placeholder: string;
        addButton: string;
        tableHeaderName: string;
        tableHeaderAction: string;
        removeButton: string;
        noNames: string;
        success: string;
        error: string;
        addSuccess: (name: string) => string;
        removeSuccess: (name: string) => string;
    };
}

export default function ReservedNames({ roomId, initialReservedNames, texts }: ReservedNamesProps) {
    const [name, setName] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState<string | boolean>(false);
    const { toast } = useToast();

    const handleAdd = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await addReservedNameToRoom(roomId, name);
            toast({ title: texts.success, description: texts.addSuccess(name) });
            setName('');
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRemove = async (nameToRemove: string) => {
        setIsSubmitting(nameToRemove);
         try {
            await removeReservedNameFromRoom(roomId, nameToRemove);
            toast({ title: texts.success, description: texts.removeSuccess(nameToRemove) });
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle>{texts.title}</CardTitle>
        <CardDescription>
          {texts.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
            <Input 
                placeholder={texts.placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!isSubmitting}
            />
            <SubmitButton onClick={handleAdd} isSubmitting={isSubmitting === true}>{texts.addButton}</SubmitButton>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{texts.tableHeaderName}</TableHead>
              <TableHead className="text-right">{texts.tableHeaderAction}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialReservedNames.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item}</TableCell>
                <TableCell className="text-right">
                  <SubmitButton 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemove(item)}
                    isSubmitting={isSubmitting === item}
                  >
                    {texts.removeButton}
                  </SubmitButton>
                </TableCell>
              </TableRow>
            ))}
             {initialReservedNames.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">{texts.noNames}</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
