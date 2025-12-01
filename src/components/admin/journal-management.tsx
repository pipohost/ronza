
'use client';

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Post, WithId } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from 'date-fns';
import { Skeleton } from "../ui/skeleton";
import { SubmitButton } from "./submit-button";

const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  imageUrl: z.string().url('Must be a valid image URL.').optional().or(z.literal('')),
  title_en: z.string().optional(),
  content_en: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: WithId<Post> | null;
  onSave: (data: PostFormValues) => Promise<void>;
}

function PostFormDialog({ isOpen, onClose, post, onSave }: PostFormDialogProps) {
  const isEditing = !!post;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: isEditing ? post : { title: '', content: '', imageUrl: '', title_en: '', content_en: '' },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(isEditing ? post : { title: '', content: '', imageUrl: '', title_en: '', content_en: '' });
    }
  }, [isOpen, post, isEditing, form]);

  const handleSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    await onSave(values);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this journal entry.' : 'Create a new post for the journal.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <Form {...form}>
            <form id="post-form-dialog" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title (Arabic)</FormLabel><FormControl><Input placeholder="Exciting new update!" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="title_en" render={({ field }) => (
                <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input placeholder="Exciting new update!" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>Content (Arabic)</FormLabel><FormControl><Textarea placeholder="Describe the update in detail..." rows={8} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content_en" render={({ field }) => (
                <FormItem><FormLabel>Content (English)</FormLabel><FormControl><Textarea placeholder="Describe the update in detail..." rows={8} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </form>
            </Form>
        </div>
        <DialogFooter className="pt-4 mt-auto">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <SubmitButton form={form.formState.isDirty ? 'post-form-dialog' : undefined} isSubmitting={isSubmitting} onClick={form.handleSubmit(handleSubmit)}>
                {isEditing ? 'Save Changes' : 'Create Post'}
            </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeletePostDialogProps {
    isOpen: boolean;
    onClose: () => void;
    post: WithId<Post> | null;
    onDelete: () => Promise<void>;
}

function DeletePostDialog({ isOpen, onClose, post, onDelete }: DeletePostDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const handleDelete = async () => {
        if (!post) return;
        setIsSubmitting(true);
        await onDelete();
        setIsSubmitting(false);
        onClose();
    };
    if (!isOpen) return null;
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the post titled "{post?.title}".</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild><Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button></AlertDialogCancel>
                    <AlertDialogAction asChild><SubmitButton variant="destructive" onClick={handleDelete} isSubmitting={isSubmitting}>Delete</SubmitButton></AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface JournalManagementProps {
  posts: WithId<Post>[];
  isLoading: boolean;
  onAddPost: (data: PostFormValues) => Promise<void>;
  onUpdatePost: (id: string, data: PostFormValues) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
}

const POSTS_PER_PAGE = 5;

export default function JournalManagement({ posts, isLoading, onAddPost, onUpdatePost, onDeletePost }: JournalManagementProps) {
  const [dialogOpen, setDialogOpen] = React.useState<string | false>(false);
  const [dialogData, setDialogData] = React.useState<WithId<Post> | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const openAddDialog = () => { setDialogData(null); setDialogOpen('add'); };
  const openEditDialog = (post: WithId<Post>) => { setDialogData(post); setDialogOpen('edit'); };
  const openDeleteDialog = (post: WithId<Post>) => { setDialogData(post); setDialogOpen('delete'); };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Journal Posts</CardTitle>
              <CardDescription>Manage posts for the public Journal page.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>Create New Post</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !posts.length ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : currentPosts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">No posts found.</TableCell></TableRow>
              ) : (
                currentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{post.authorName}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(post.timestamp), 'PPP')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Actions</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(post)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
                        <span className="sr-only">Previous Page</span>
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
                        <span className="sr-only">Next Page</span>
                    </Button>
                </div>
            </CardFooter>
        )}
      </Card>

      <PostFormDialog
        isOpen={dialogOpen === 'add' || dialogOpen === 'edit'}
        onClose={() => setDialogOpen(false)}
        post={dialogData}
        onSave={dialogData ? (data) => onUpdatePost(dialogData.id, data) : onAddPost}
      />
      <DeletePostDialog
        isOpen={dialogOpen === 'delete'}
        onClose={() => setDialogOpen(false)}
        post={dialogData}
        onDelete={() => { if (dialogData) return onDeletePost(dialogData.id); return Promise.resolve(); }}
      />
    </>
  );
}
