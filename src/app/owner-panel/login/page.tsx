'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Lock, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyOwnerPanelPassword } from '@/app/actions/owner-panel';
import { SubmitButton } from '@/components/admin/submit-button';
import { getFirebase } from '@/app/chat-room/[roomId]/firebase-client';
import { getFirebaseConfig } from '@/lib/server-data';
import type { FirebaseServices } from '@/app/chat-room/[roomId]/firebase-client';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';

export default function OwnerPanelLoginPage() {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const { t, toggleLanguage, lang, dir } = useTranslation();
  const loginT = t.loginPages.owner;

  useEffect(() => {
    const initialize = async () => {
        const config = await getFirebaseConfig();
        const services = await getFirebase(config);
        setFirebaseServices(services);
    };
    initialize();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!firebaseServices || !firebaseServices.auth.currentUser) {
        setError('Authentication service not ready. Please try again in a moment.');
        setIsLoading(false);
        return;
    }

    try {
        const idToken = await firebaseServices.auth.currentUser.getIdToken();
        const result = await verifyOwnerPanelPassword(roomName, password, idToken);
        
        if (result.success && result.roomId) {
            toast({
                title: loginT.successTitle,
                description: loginT.successDescription,
            });
            
            router.push(`/owner-panel/${result.roomId}`);
        } else {
            setError(result.message || loginT.invalidCredentials);
        }
    } catch(err: any) {
        console.error("Login Error:", err);
        setError(err.message || loginT.unexpectedError);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-md shadow-lg relative">
        <div className="absolute top-4 right-4">
             <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Languages className="mr-2 h-4 w-4" />
              {lang === 'ar' ? 'English' : 'العربية'}
            </Button>
        </div>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary text-primary-foreground p-3 rounded-full">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">{loginT.title}</CardTitle>
          <CardDescription>{loginT.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{loginT.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="roomName">{loginT.roomNameLabel}</Label>
              <Input
                id="roomName"
                type="text"
                placeholder={loginT.roomNamePlaceholder}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                dir="auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{loginT.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton type="submit" className="w-full" isSubmitting={isLoading} disabled={isLoading || !firebaseServices}>
              {isLoading ? loginT.loggingIn : loginT.loginButton}
            </SubmitButton>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
