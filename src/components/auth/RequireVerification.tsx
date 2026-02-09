import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, RefreshCw, Loader2, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

interface RequireVerificationProps {
  children: ReactNode;
}

export function RequireVerification({ children }: RequireVerificationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    checkVerificationStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkVerificationStatus();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsVerified(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setUser(null);
        setIsVerified(false);
        setIsLoading(false);
        return;
      }

      setUser(user);
      setIsVerified(!!user.email_confirmed_at);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // No user - show loading while ProtectedRoute handles redirect
  // CRITICAL: Never return children here to prevent content flash
  if (!user) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // User is verified - show children
  if (isVerified) {
    return <>{children}</>;
  }

  // User is NOT verified - show blocked screen
  return (
    <VerificationBlockedScreen 
      user={user} 
      onRefresh={checkVerificationStatus}
    />
  );
}

interface VerificationBlockedScreenProps {
  user: User;
  onRefresh: () => void;
}

function VerificationBlockedScreen({ user, onRefresh }: VerificationBlockedScreenProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);

  const handleResendEmail = async () => {
    if (!user.email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        toast({
          title: 'Failed to send verification email',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: 'Verification email sent',
        description: `Please check your inbox at ${user.email}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (error) {
        toast({
          title: 'Failed to update email',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setEmailUpdated(true);
      setShowUpdateForm(false);
      toast({
        title: 'Confirmation email sent',
        description: `Please check your inbox at ${newEmail.trim()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update email address',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md gaming-card border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Email Verification Required</CardTitle>
            <CardDescription>
              Please verify your email address to access SkyServer.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Current email display */}
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Verification link sent to:</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>

            {/* Success states */}
            {emailSent && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Verification email sent! Check your inbox.</span>
              </div>
            )}

            {emailUpdated && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Confirmation link sent to {newEmail}. Check your inbox.</span>
              </div>
            )}

            {/* Main actions */}
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onRefresh}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                I've Verified My Email
              </Button>
            </div>

            {/* Update email section */}
            <div className="pt-2 border-t border-border">
              {!showUpdateForm ? (
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Made a typo? <span className="underline">Update your email address</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>A confirmation link will be sent to your new email.</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="Enter your correct email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUpdateForm(false);
                        setNewEmail('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail || !newEmail.trim()}
                      className="flex-1"
                    >
                      {isUpdatingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Email'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign out option */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
