import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, LogOut, CheckCircle } from 'lucide-react';

export function EmailVerificationGuard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setIsResending(true);

    const { error } = await supabase.functions.invoke('send-auth-email', {
      body: { type: 'signup', email: user.email },
    });

    setIsResending(false);

    if (error) {
      toast({
        title: 'Failed to resend',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setHasSent(true);
    toast({
      title: 'Verification email sent!',
      description: 'Please check your inbox and spam folder.',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

      <Card className="relative w-full max-w-md gaming-card border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Email Verification Required</CardTitle>
          <CardDescription className="text-base">
            You need to verify your email address before accessing the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Verification email was sent to:</p>
            <p className="mt-1 font-medium text-foreground">{user?.email}</p>
          </div>

          {hasSent && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>A new verification email has been sent. Check your inbox!</span>
            </div>
          )}

          <Button
            onClick={handleResend}
            disabled={isResending}
            className="w-full glow-primary"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={signOut}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            After verifying, refresh this page or sign in again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
