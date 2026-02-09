import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ShieldAlert, Loader2, Pencil } from 'lucide-react';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const isVerified = !!session?.user?.email_confirmed_at;
  const userEmail = session?.user?.email || '';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (isVerified) {
    return <>{children}</>;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: 'https://www.skyserver1508.org/dashboard',
        },
      });

      if (error) throw error;

      toast({
        title: 'Verification email sent!',
        description: `We sent a new verification link to ${userEmail}.`,
      });
      setCooldown(60);
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === userEmail) return;

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: 'https://www.skyserver1508.org/dashboard' }
      );

      if (error) throw error;

      toast({
        title: 'Email updated!',
        description: `A verification link has been sent to ${newEmail.trim()}.`,
      });
      setShowEmailEdit(false);
      setNewEmail('');
      setCooldown(60);
    } catch (error: any) {
      toast({
        title: 'Failed to update email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

        <Card className="relative w-full max-w-md gaming-card border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="font-display text-2xl">Verification Required</CardTitle>
            <CardDescription>
              You need to verify your email address before accessing the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Verification email sent to</p>
              <p className="font-medium text-foreground">{userEmail}</p>
            </div>

            <Button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="w-full glow-primary"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            {!showEmailEdit ? (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setShowEmailEdit(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Wrong email? Update it
              </Button>
            ) : (
              <form onSubmit={handleUpdateEmail} className="space-y-3 rounded-lg border border-border p-3">
                <Label htmlFor="newEmail" className="text-sm">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="correct@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isUpdatingEmail} className="flex-1">
                    {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update & Resend'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowEmailEdit(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Check your spam folder if you don't see the email.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
