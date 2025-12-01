'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebase } from '@/app/chat-room/[roomId]/firebase-client';
import { getFirebaseConfig } from '@/lib/server-data';
import { useRouter } from 'next/navigation';
import { createAdminSessionAction } from '@/app/actions/admin';


export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        const firebaseConfig = await getFirebaseConfig();
        const { auth } = await getFirebase(firebaseConfig);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        const sessionResult = await createAdminSessionAction(idToken);

        if (!sessionResult.success) {
            throw new Error(sessionResult.message || 'Failed to create a server session.');
        }
        
        toast({
            title: 'تم تسجيل الدخول بنجاح!',
            description: 'سيتم توجيهك إلى لوحة التحكم.',
        });
        
        router.push('/admin');

    } catch(error: any) {
        console.error("Login failed:", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        } else {
            setError(error.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary text-primary-foreground p-3 rounded-full">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">دخول لوحة الإدارة</CardTitle>
          <CardDescription>الرجاء استخدام بيانات اعتماد المدير للوصول.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>خطأ في الدخول</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
