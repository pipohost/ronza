'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { addFilteredWord, removeFilteredWord } from "@/app/actions/owner-panel";
import { SubmitButton } from '../admin/submit-button';

interface WordFilterProps {
    roomId: string;
    initialWordFilter: string[];
    texts: {
        title: string;
        description: string;
        placeholder: string;
        addButton: string;
        tableHeaderWord: string;
        tableHeaderAction: string;
        removeButton: string;
        noWords: string;
        success: string;
        error: string;
        addSuccess: (word: string) => string;
        removeSuccess: (word: string) => string;
    };
}

export default function WordFilter({ roomId, initialWordFilter, texts }: WordFilterProps) {
    const [word, setWord] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState<string | boolean>(false);
    const { toast } = useToast();

    const handleAdd = async () => {
        if (!word.trim()) return;
        setIsSubmitting(true);
        try {
            await addFilteredWord(roomId, word);
            toast({ title: texts.success, description: texts.addSuccess(word) });
            setWord('');
        } catch (error: any) {
            toast({ variant: "destructive", title: texts.error, description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRemove = async (wordToRemove: string) => {
        setIsSubmitting(wordToRemove);
         try {
            await removeFilteredWord(roomId, wordToRemove);
            toast({ title: texts.success, description: texts.removeSuccess(wordToRemove) });
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
        <CardDescription>{texts.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
            <Input 
                placeholder={texts.placeholder}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                disabled={!!isSubmitting}
            />
            <SubmitButton onClick={handleAdd} isSubmitting={isSubmitting === true}>{texts.addButton}</SubmitButton>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{texts.tableHeaderWord}</TableHead>
              <TableHead className="text-right">{texts.tableHeaderAction}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialWordFilter.map((item, index) => (
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
             {initialWordFilter.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">{texts.noWords}</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
