import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      // Handle Supabase's confirmation redirect
      if (type === 'signup' || type === 'email') {
        // Supabase handles the verification automatically via the URL
        // We just need to check if the session is valid
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsSuccess(true);
          
          // Send welcome email
          try {
            const user = session.user;
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: user.email,
                userName: user.user_metadata?.full_name,
                dashboardUrl: `${window.location.origin}/dashboard`,
              },
            });
          } catch (e) {
            console.error('Failed to send welcome email:', e);
          }
          
          toast({
            title: 'Email Verified!',
            description: 'Your account is now active. Welcome to SkyServer!',
          });
        } else {
          setError('Verification failed. The link may have expired.');
        }
      } else if (!token && !type) {
        // No token or type - show pending verification message
        setError('waiting');
      } else {
        setError('Invalid verification link.');
      }
      
      setIsVerifying(false);
    };

    verifyEmail();
  }, [searchParams, toast]);

  if (isVerifying) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

          <Card className="relative w-full max-w-md gaming-card border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <CardTitle className="font-display text-2xl">Verifying Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

          <Card className="relative w-full max-w-md gaming-card border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="font-display text-2xl">Email Verified! 🎉</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You're all set to start using SkyServer!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard" className="w-full">
                <Button className="w-full glow-primary">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error === 'waiting') {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

          <Card className="relative w-full max-w-md gaming-card border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address. Please click the link to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or try registering again.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/register" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Register
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Already verified? Sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

        <Card className="relative w-full max-w-md gaming-card border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="font-display text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              {error || 'Something went wrong during verification.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link to="/register" className="w-full">
              <Button className="w-full glow-primary">
                Try Again
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
