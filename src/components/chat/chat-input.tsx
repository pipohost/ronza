
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bed, Car, CaseSensitive, DoorOpen, GlassWater, Moon, Palette, PenLine, Phone, Send, Smile, Utensils, MicOff, Mic, Video as VideoIcon, VideoOff, Hand, MoreVertical, Volume2, VolumeX, Lock, Unlock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import type { User, WithId } from '@/lib/types';


interface ChatInputProps {
  onSendMessage: (text: string, color: string) => void;
  onSendPrivateMessage: (toId: string, text: string, color: string) => void;
  onStatusChange: (status: string, statusText?: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  disabled?: boolean;
  onMicToggle: () => void;
  onCameraToggle: () => void;
  onHandRaise: () => void;
  onRoomLockToggle: () => void;
  isMicMutedByOwner: boolean;
  me?: WithId<User>;
  onRoomMuteToggle: () => void;
  isRoomMuted: boolean;
  isRoomLocked: boolean;
  activeTab: string;
}


export default function ChatInput({ 
    onSendMessage,
    onSendPrivateMessage,
    onStatusChange,
    onTypingChange,
    disabled = false,
    onMicToggle,
    onCameraToggle,
    onHandRaise,
    onRoomLockToggle,
    isMicMutedByOwner,
    me,
    onRoomMuteToggle,
    isRoomMuted,
    isRoomLocked,
    activeTab
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [color, setColor] = useState<string>('hsl(var(--foreground))');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { playMessageSent } = useSoundEffects();

  useEffect(() => {
    if (activeTab === 'public') {
      onTypingChange(text.length > 0);
    } else {
        onTypingChange(false);
    }
  }, [text, activeTab, onTypingChange]);


  useEffect(() => {
    const savedColor = localStorage.getItem('ronza_chat_color');
    if (savedColor) {
      setColor(savedColor);
    }
  }, []);

  const handleSetColor = (newColor: string) => {
    setColor(newColor);
    localStorage.setItem('ronza_chat_color', newColor);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (disabled && activeTab === 'public') return;
    setText(prevText => prevText + emojiData.emoji);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === 'public' && disabled) {
        toast({ variant: 'destructive', title: t.muted_placeholder });
        return;
    }
    if (text.trim()) {
      playMessageSent();
      if (activeTab === 'public') {
        onSendMessage(text, color);
      } else {
        onSendPrivateMessage(activeTab, text, color);
      }
      setText('');
      onTypingChange(false);
    }
  };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }
    };
  
  const statuses = [
    { id: 'sleeping', text: t.status_sleeping, icon: <Bed className="w-5 h-5 text-purple-500" /> },
    { id: 'eating', text: t.status_eating, icon: <Utensils className="w-5 h-5 text-orange-500" /> },
    { id: 'drinking', text: t.status_drinking, icon: <GlassWater className="w-5 h-5 text-blue-500" /> },
    { id: 'away', text: t.status_away, icon: <DoorOpen className="w-5 h-5 text-gray-500" /> },
    { id: 'driving', text: t.status_driving, icon: <Car className="w-5 h-5 text-red-500" /> },
    { id: 'oncall', text: t.status_oncall, icon: <Phone className="w-5 h-5 text-green-500" /> },
  ];

  const handleCustomStatus = () => {
    const statusText = prompt(t.status_custom_prompt);
    if (statusText !== null) {
        onStatusChange('custom', statusText.substring(0, 30));
    }
  }

  const colorPalette = [
    'hsl(var(--foreground))',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff8800', '#8800ff', '#0088ff', '#ff0088', '#88ff00', '#00ff88',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#c0c0c0', '#808080',
  ];

  const currentPlaceholder = activeTab === 'public' 
    ? (disabled ? t.muted_placeholder : t.placeholder)
    : t.room.pm_placeholder;
  
  const canSetCustomStatus = me && (me.role === 'admin' || me.role === 'superadmin' || me.role === 'special' || me.cosmeticRole === 'mythical_admin' || me.cosmeticRole === 'super_name' || me.cosmeticRole === 'background_name' || me.cosmeticRole === 'registered_member');
  const canLockRoom = me && (me.role === 'admin' || me.role === 'superadmin' || me.cosmeticRole === 'mythical_admin');


  return (
    <div 
        className="p-2 md:p-3 border-t bg-white dark:bg-gray-900 shadow-inner flex-shrink-0"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentPlaceholder}
          disabled={activeTab === 'public' && disabled}
          maxLength={250}
          className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-full px-4 focus-visible:ring-1 focus-visible:ring-primary h-12"
          style={{fontSize: '18pt', color: color}}
        />

        <div className="flex items-center gap-0.5 rounded-full bg-gray-200 dark:bg-gray-800 p-1">
            <div className="hidden md:flex items-center gap-0.5">
                 {/* Desktop controls */}
                <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner" onClick={onRoomMuteToggle} title={t.room.mute_room_tooltip}>
                    {isRoomMuted ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                {canLockRoom && (
                     <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner" onClick={onRoomLockToggle} title={isRoomLocked ? t.moderation.unlockRoom : t.moderation.lockRoom}>
                        {isRoomLocked ? <Lock className="h-5 w-5 text-red-500" /> : <Unlock className="h-5 w-5" />}
                    </Button>
                )}
                <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner" onClick={onMicToggle} disabled={isMicMutedByOwner} title={isMicMutedByOwner ? t.room.mic_muted_by_owner_tooltip : t.room.toggle_mic_tooltip}>
                    {me?.isMuted || isMicMutedByOwner ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className={cn("h-5 w-5", me?.isSpeaking && "text-green-500")} />}
                </Button>
                <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner" onClick={onCameraToggle} title={t.room.toggle_camera_tooltip}>
                    {me?.isCameraOn ? <VideoIcon className="h-5 w-5 text-blue-500" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover-bg-gray-700 active:shadow-inner" onClick={onHandRaise} title={t.room.raise_hand_tooltip}>
                    <Hand className={cn("h-5 w-5", me?.handRaised && "text-yellow-500")} />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" title={t.color} disabled={activeTab === 'public' && disabled}>
                            <Palette className="h-5 w-5 text-blue-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2">
                        <div className="p-2 grid grid-cols-8 gap-2">
                            {colorPalette.map((c, i) => (
                                <button
                                    key={i} type="button"
                                    className={cn("w-6 h-6 rounded-full border-2", color === c ? 'border-primary ring-2 ring-primary' : 'border-gray-200')}
                                    style={{ backgroundColor: c }} onClick={() => handleSetColor(c)}
                                />
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" title={t.emoji} disabled={activeTab === 'public' && disabled}>
                            <Smile className="h-5 w-5 text-yellow-500" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border-0 mb-2">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </PopoverContent>
                </Popover>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" title={t.status} disabled={disabled}>
                            <Moon className="h-5 w-5 text-purple-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mb-2">
                        {statuses.map(status => (
                            <DropdownMenuItem key={status.id} onClick={() => onStatusChange(status.id)} className="flex items-center gap-2">
                                {status.icon}
                                <span>{status.text}</span>
                            </DropdownMenuItem>
                        ))}
                        {canSetCustomStatus && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleCustomStatus} className="flex items-center gap-2">
                                    <PenLine className="h-4 w-4" />
                                    <span>{t.status_custom}</span>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStatusChange('')}>
                            {t.status_clear}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
             {/* Mobile controls */}
            <div className="md:hidden">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner">
                          <MoreVertical className="h-5 w-5" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mb-2">
                       {canLockRoom && (
                            <DropdownMenuItem onClick={onRoomLockToggle} className="flex justify-between">
                                <span>{isRoomLocked ? t.moderation.unlockRoom : t.moderation.lockRoom}</span>
                                {isRoomLocked ? <Lock className="h-5 w-5 text-red-500" /> : <Unlock className="h-5 w-5" />}
                            </DropdownMenuItem>
                        )}
                      <DropdownMenuItem onClick={onRoomMuteToggle} className="flex justify-between">
                          <span>{t.room.mute_room_dropdown}</span>
                          {isRoomMuted ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onMicToggle} disabled={isMicMutedByOwner} className="flex justify-between">
                          <span>{isMicMutedByOwner ? t.room.mic_muted_by_owner_dropdown : t.room.mic_dropdown}</span>
                          {me?.isMuted || isMicMutedByOwner ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className={cn("h-5 w-5", me?.isSpeaking && "text-green-500")} />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onCameraToggle} className="flex justify-between">
                          <span>{t.room.camera_dropdown}</span>
                          {me?.isCameraOn ? <VideoIcon className="h-5 w-5 text-blue-500" /> : <VideoOff className="h-5 w-5" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onHandRaise} className="flex justify-between">
                          <span>{t.room.raise_hand_dropdown}</span>
                          <Hand className={cn("h-5 w-5", me?.handRaised && "text-yellow-500")} />
                      </DropdownMenuItem>
                        <Popover>
                            <PopoverTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Smile className="mr-2 h-4 w-4" />
                                    <span>{t.emoji}</span>
                                </DropdownMenuItem>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 border-0 mb-2">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </PopoverContent>
                        </Popover>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
        
        <Button type="submit" size="icon" className="bg-sky-gradient text-white rounded-full w-12 h-12">
          <Send className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
}

    