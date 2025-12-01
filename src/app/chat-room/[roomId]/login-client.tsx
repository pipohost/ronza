
'use client';

import * as React from 'react';
import type { User, Room, WithId } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User as UserIcon, X, Loader2, Anchor, Angry, Annoyed, Award, Axe, Baby, Banana, Bed, Bell, Bike, Bird, Bomb, Bone, Bot, Box, Brain, Briefcase, Brush, Bug, Bus, Cake, Camera, Car, Carrot, Castle, Cat, Check, Cherry, ChefHat, Church, Cigarette, Circle, Citrus, Clapperboard, Cloud, Clover, Code, Coffee, Cog, Coins, Comet, Compass, ConciergeBell, Construction, Contact, Cookie,Cpu, Crown,CupSoda, Diamond, Dice1, Dog, Dolce, Donut, DoorClosed, Drama, Dribbble, Dumbbell, Egg, Feather, FerrisWheel, Figma, File, Film, Fish, Flag, Flame, Flashlight, FlaskConical, FlaskRound, Flower, Folder, Football, Forklift, Fortress, Frame, Frown, Fuel, FunctionSquare, Gamepad, Gem, Ghost, Gift, GitBranch, Github, Gitlab, GlassWater, Glasses, Globe, Grab, Grape, Grid, Grip, Hammer, Hand, HandMetal, HandPlatter, Handshake,HardDrive, HardHat, Hash, Haze, Heading, Heart,HelpCircle, Hexagon, Highlighter, Home, Hop, HopOff, Hotel, Hourglass, IceCream, Image, Inbox, Indent, IndianRupee, Info, Instagram, Italic, IterationCcw, IterationCw, JapaneseYen, Joystick, Key, Keyboard, Lamp, Landmark, Languages, Laptop, Lasso, Laugh, Layout, Leaf, Library, LifeBuoy, Lightbulb, Link, Linkedin, List, Lock, LogIn, LogOut, Luggage, Magnet, Mail, Map, Martini, Medal, Megaphone, Meh, Menu, MessageCircle, MessageSquare, Mic, Mic2, Microscope, Microwave, Milestone, Milk, Minus, Monitor, Moon,MoreHorizontal, MoreVertical, Mountain, Mouse, MousePointer, Move, Music, Navigation, Newspaper, Nut, Option,Package, Palmtree, Paperclip, ParkingCircle, PartyPopper, Pause, PcCase, Pen, Pencil, Percent, PersonStanding, Phone, PictureInPicture, PieChart, PiggyBank, Pin, Pipette, Plane, Plug, Plus, Pocket, Podcast, Pointer, PoundSterling, Power, Presentation, Printer,Projector, Puzzle, QrCode, Quote, Rabbit, Rat, Receipt, RectangleHorizontal, RectangleVertical, Recycle, Redo, RefreshCcw, RefreshCw, Refrigerator, Regex, Reply, ReplyAll, Rewind, Rocket,RotateCcw, RotateCw, Rss, Ruler, RussianRuble, Sailboat, Save, Scale, Scan, School, Scissors, ScreenShare, Scroll, Search, Send, SeparatorHorizontal, Server, Settings, Share, Shield,Ship, ShoppingBag, ShoppingCart, Shovel, ShowerHead,Shrub, Sigma, Signal, Siren,SkipBack, SkipForward, Skull,Slack, Slice, Sliders, Smartphone,Smile, Snowflake, Sofa, SortAsc,SortDesc, Soup, Speaker, Spline,Sprout, Square, Star, Store,Strikethrough, Subscript, Sun,Superscript, SwissFranc, SwitchCamera,Table, Tablet, Tag, Target, Tent,Terminal, Text, ThumbsDown, ThumbsUp,Ticket, Timer, Trello, TrendingDown,TrendingUp, Triangle, Trophy, Truck,Tv, Twitch, Twitter, Type, Underline,Undo, UnfoldHorizontal, UnfoldVertical,Unlink, Upload, Usb, Users,Utensils, Vault, VenetianMask, Vibrate,Video, View, Voicemail, Volume, Volume1,Volume2, VolumeX, Wallet, Wand,Watch, Waves, Webcam, Webhook,Wheat, Wifi, Wind, Wine, Youtube,Zap, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { joinRoom } from '@/app/actions/user-join';
import { getFirebase, FirebaseServices } from './firebase-client';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/use-translation';


const icons = [Anchor, Angry, Annoyed, Award, Axe, Baby, Banana, Bed, Bell, Bike, Bird, Bomb, Bone, Bot, Box, Brain, Briefcase, Brush, Bug, Bus, Cake, Camera, Car, Carrot, Castle, Cat, Check, Cherry, ChefHat, Church, Cigarette, Circle, Citrus, Clapperboard, Cloud, Clover, Code, Coffee, Cog, Coins, Comet, Compass, ConciergeBell, Construction, Contact, Cookie,Cpu, Crown,CupSoda, Diamond, Dice1, Dog, Dolce, Donut, DoorClosed, Drama, Dribbble, Dumbbell, Egg, Feather, FerrisWheel, Figma, File, Film, Fish, Flag, Flame, Flashlight, FlaskConical, FlaskRound, Flower, Folder, Football, Forklift, Fortress, Frame, Frown, Fuel, FunctionSquare, Gamepad, Gem, Ghost, Gift, GitBranch, Github, Gitlab, GlassWater, Glasses, Globe, Grab, Grape, Grid, Grip, Hammer, Hand, HandMetal, HandPlatter, Handshake,HardDrive, HardHat, Hash, Haze, Heading, Heart,HelpCircle, Hexagon, Highlighter, Home, Hop, HopOff, Hotel, Hourglass, IceCream, Image, Inbox, Indent, IndianRupee, Info, Instagram, Italic, IterationCcw, IterationCw, JapaneseYen, Joystick, Key, Keyboard, Lamp, Landmark, Languages, Laptop, Lasso, Laugh, Layout, Leaf, Library, LifeBuoy, Lightbulb, Link, Linkedin, List, Lock, LogIn, LogOut, Luggage, Magnet, Mail, Map, Martini, Medal, Megaphone, Meh, Menu, MessageCircle, MessageSquare, Mic, Mic2, Microscope, Microwave, Milestone, Milk, Minus, Monitor, Moon,MoreHorizontal, MoreVertical, Mountain, Mouse, MousePointer, Move, Music, Navigation, Newspaper, Nut, Option,Package, Palmtree, Paperclip, ParkingCircle, PartyPopper, Pause, PcCase, Pen, Pencil, Percent, PersonStanding, Phone, PictureInPicture, PieChart, PiggyBank, Pin, Pipette, Plane, Plug, Plus, Pocket, Podcast, Pointer, PoundSterling, Power, Presentation, Printer,Projector, Puzzle, QrCode, Quote, Rabbit, Rat, Receipt, RectangleHorizontal, RectangleVertical, Recycle, Redo, RefreshCcw, RefreshCw, Refrigerator, Regex, Reply, ReplyAll, Rewind, Rocket,RotateCcw, RotateCw, Rss, Ruler, RussianRuble, Sailboat, Save, Scale, Scan, School, Scissors, ScreenShare, Scroll, Search, Send, SeparatorHorizontal, Server, Settings, Share, Shield,Ship, ShoppingBag, ShoppingCart, Shovel, ShowerHead,Shrub, Sigma, Signal, Siren,SkipBack, SkipForward, Skull,Slack, Slice, Sliders, Smartphone,Smile, Snowflake, Sofa, SortAsc,SortDesc, Soup, Speaker, Spline,Sprout, Square, Star, Store,Strikethrough, Subscript, Sun,Superscript, SwissFranc, SwitchCamera,Table, Tablet, Tag, Target, Tent,Terminal, Text, ThumbsDown, ThumbsUp,Ticket, Timer, Trello, TrendingDown,TrendingUp, Triangle, Trophy, Truck,Tv, Twitch, Twitter, Type, Underline,Undo, UnfoldHorizontal, UnfoldVertical,Unlink, Upload, Usb, Users,Utensils, Vault, VenetianMask, Vibrate,Video, View, Voicemail, Volume, Volume1,Volume2, VolumeX, Wallet, Wand,Watch, Waves, Webcam, Webhook,Wheat, Wifi, Wind, Wine, Youtube,Zap, ZoomIn, ZoomOut];

const iconColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA', 
    '#F0B8B8', '#97EAD2', '#F9D423', '#FF5733', '#C70039', 
    '#900C3F', '#581845', '#DAF7A6', '#FFC300', '#FF5733'
];

const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('ronza_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('ronza_device_id', deviceId);
    }
    return deviceId;
};

export default function LoginClient({ room, firebaseConfig, onClose, onLoginSuccess }: {
    room: WithId<Room>;
    initialUsers?: WithId<User>[];
    firebaseConfig: any;
    onClose: () => void;
    onLoginSuccess: (userProfile: WithId<User>, firebaseServices: FirebaseServices) => void;
}) {
  const { toast } = useToast();
  const { t, lang, toggleLanguage, dir } = useTranslation();
  const loginT = t.loginPages.joinRoom;

  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  const [firebase, setFirebase] = React.useState<FirebaseServices | null>(null);
  const [isJoining, setIsJoining] = React.useState(false);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [idToken, setIdToken] = React.useState<string | null>(null);
  
  const [selectedAvatar, setSelectedAvatar] = React.useState<{ name: string, color: string } | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // Set a deterministic default icon to prevent hydration mismatch
    const defaultIcon = icons[0];
    if (defaultIcon && defaultIcon.displayName) {
        setSelectedAvatar({ name: defaultIcon.displayName, color: iconColors[0] });
    }
  }, []);

  React.useEffect(() => {
    getFirebase(firebaseConfig)
      .then(firebaseServices => {
        setFirebase(firebaseServices);
        const unsubscribe = onAuthStateChanged(firebaseServices.auth, async (user) => {
          if (user) {
            try {
              const token = await user.getIdToken(true);
              setIdToken(token);
              setIsAuthReady(true);
              setAuthError(null);
            } catch (error) {
              console.error("Error getting ID token", error);
              setAuthError(loginT.authError);
              setIsAuthReady(false);
            }
          } else {
             setIsAuthReady(false);
             setIdToken(null);
             setAuthError(loginT.notSignedIn);
          }
        });
        return () => unsubscribe();
      })
      .catch(error => {
        console.error("Firebase setup failed:", error);
        setAuthError(loginT.firebaseError);
        setIsAuthReady(false);
      });
  }, [firebaseConfig, loginT]);
  
  
  const handleLoginClick = async () => {
    if (!isAuthReady || !room || !firebase || !idToken || !selectedAvatar) {
        toast({ variant: "destructive", title: "Error", description: authError || loginT.notReady });
        return;
    }
    if (isJoining) return;

    setIsJoining(true);

    try {
        const userProfile = await joinRoom({
            idToken,
            roomId: room.id,
            userName: name,
            password: password,
            avatarUrl: selectedAvatar.name,
            avatarColor: selectedAvatar.color,
            deviceId: getDeviceId(),
            lang: lang,
        });
        onLoginSuccess(userProfile, firebase);
    } catch(e: any) {
        console.error("Error joining room: ", e);
        toast({ variant: "destructive", title: "Error", description: e.message || loginT.joinError });
    } finally {
        setIsJoining(false);
    }
  };

  const getAuthMessage = () => {
      if (authError) return authError;
      if (!isAuthReady) return loginT.authInit;
      return loginT.joinButton;
  }

  if (!isClient) {
    return (
        <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Initializing...</p>
            </div>
        </div>
    );
  }

    return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4" dir={dir}>
            <Card className="w-full max-w-sm shadow-2xl rounded-2xl">
                 <div className="absolute top-4 flex items-center" style={{ [lang === 'ar' ? 'left' : 'right']: '1rem' }}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground z-10" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                     <Button variant="ghost" size="sm" className="text-muted-foreground z-10" onClick={toggleLanguage}>
                        <Languages className="w-4 h-4" />
                        <span className="sr-only">{t.langSwitch}</span>
                    </Button>
                </div>
                <CardHeader className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                    <CardTitle className="text-xl font-bold">{loginT.title.replace('{roomName}', room.name)}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-right">
                        <Label htmlFor="name" className="font-semibold">{loginT.yourName}</Label>
                        <Input id="name" placeholder={loginT.namePlaceholder} className="text-right h-11 text-base" value={name} onChange={e => setName(e.target.value)} maxLength={20} />
                    </div>
                    <div className="space-y-2 text-right">
                        <Label htmlFor="password">{loginT.passwordLabel}</Label>
                        <Input id="password" type="password" placeholder={loginT.passwordPlaceholder} className="text-right h-11 text-base" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2 text-right">
                        <Label className="font-semibold">{loginT.avatarLabel}</Label>
                        <ScrollArea className="h-40 w-full rounded-md border p-2 bg-secondary/50">
                            <div className="grid grid-cols-6 gap-2">
                                {icons.map((Icon, index) => {
                                    if (!Icon || !Icon.displayName) return null; // Check if Icon and displayName are defined
                                    const iconName = Icon.displayName;
                                    const color = iconColors[index % iconColors.length];
                                    const isSelected = selectedAvatar?.name === iconName;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={cn(
                                                "w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200",
                                                isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-primary/10'
                                            )}
                                            onClick={() => setSelectedAvatar({ name: iconName, color })}
                                        >
                                            <Icon style={{ color: color }} size={32} />
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                    <Button size="lg" className="w-full h-12 text-lg" onClick={handleLoginClick} disabled={!isAuthReady || isJoining}>
                        {(isJoining || !isAuthReady) && <Loader2 className={cn(lang === 'ar' ? 'ml-2' : 'mr-2', 'h-5 w-5 animate-spin')} />}
                        {isJoining ? loginT.joiningButton : getAuthMessage()}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
