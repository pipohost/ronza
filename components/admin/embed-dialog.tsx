
'use client';

import * as React from 'react';
import type { Room, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Code, Copy } from 'lucide-react';

const getIconSvg = (iconName: string) => {
    // This is a simplified lookup. In a real app, you might have a more dynamic way to get SVGs.
    const iconMap: { [key: string]: string } = {
        MessageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
        Heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
        Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
        Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
        Briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
        Music: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
        Code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
        Gamepad2: '<line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><path d="M13 4v4"></path><path d="M17 8h-4"></path><path d="M4 15c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H4z"></path>',
        Film: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path>',
    };
    return iconMap[iconName] || iconMap['MessageSquare'];
};

const generateEmbedCode = (room: WithId<Room>): string => {
  const iconSvgPaths = getIconSvg(room.icon || 'MessageSquare');
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-primary">${iconSvgPaths}</svg>`;

  return `
<!-- Start Ronza4Chat Embed Code -->
<style>
  .ronza-card {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.3s ease;
    max-width: 320px;
    background-color: #ffffff;
  }
  .ronza-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  .ronza-header {
    background-color: #f3f4f6;
    height: 6rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ronza-header .text-primary {
    color: #3b82f6;
  }
  .ronza-content {
    padding-top: 1.5rem;
    flex-grow: 1;
    text-align: center;
  }
  .ronza-content h3 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .ronza-users {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }
  .ronza-users svg {
    height: 1rem;
    width: 1rem;
  }
  .ronza-footer {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
  }
  .ronza-button {
    width: 100%;
    background-color: #3b82f6;
    color: #ffffff;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    text-align: center;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }
  .ronza-button:hover {
    background-color: #2563eb;
  }
</style>
<div class="ronza-card">
  <div class="ronza-header">
    ${iconSvg}
  </div>
  <div class="ronza-content">
    <h3>${room.name}</h3>
    <div class="ronza-users">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span>${room.userCount || 0} / ${room.maxUsers}</span>
    </div>
  </div>
  <div class="ronza-footer">
    <a href="${window.location.origin}/chat-room/${room.id}" target="_blank" class="ronza-button">انضم الآن</a>
  </div>
</div>
<!-- End Ronza4Chat Embed Code -->
`;
};

interface EmbedDialogProps {
    isOpen: boolean;
    onClose: () => void;
    room: WithId<Room> | null;
}

export function EmbedDialog({ isOpen, onClose, room }: EmbedDialogProps) {
    const { toast } = useToast();
    const [embedCode, setEmbedCode] = React.useState('');

    React.useEffect(() => {
        if (room && typeof window !== 'undefined') {
            setEmbedCode(generateEmbedCode(room));
        }
    }, [room]);

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        toast({
            title: "Code Copied!",
            description: "The embed code has been copied to your clipboard.",
        });
    }

    if (!room) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Embed Room: {room.name}
                    </DialogTitle>
                    <DialogDescription>
                        Copy and paste this HTML code into your website to embed this room card.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto max-h-96">
                        <code>
                            {embedCode.trim()}
                        </code>
                    </pre>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={handleCopy}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
