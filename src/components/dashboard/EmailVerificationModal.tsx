import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailVerificationModalProps {
  open: boolean;
  userEmail: string | null;
  isResending: boolean;
  isUpdatingEmail: boolean;
  onResendEmail: () => Promise<{ error: Error | null }>;
  onUpdateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  onRefreshStatus: () => void;
}

export function EmailVerificationModal({
  open,
  userEmail,
  isResending,
  isUpdatingEmail,
  onResendEmail,
  onUpdateEmail,
  onRefreshStatus,
}: EmailVerificationModalProps) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    const { error } = await onResendEmail();

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
      description: `Please check your inbox at ${userEmail}`,
    });
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your new email address',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await onUpdateEmail(newEmail.trim());

    if (error) {
      toast({
        title: 'Failed to update email',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setNewEmail('');
    setShowUpdateForm(false);
    toast({
      title: 'Confirmation email sent',
      description: `Please check your inbox at ${newEmail.trim()} to confirm the change`,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        hideCloseButton 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Verify Your Email</DialogTitle>
          <DialogDescription className="text-center">
            Please verify your email address to access SkyServer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current email display */}
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">Verification link sent to:</p>
            <p className="font-medium text-foreground">{userEmail}</p>
          </div>

          {/* Success state after resending */}
          {emailSent && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Verification email sent! Check your inbox.</span>
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
              onClick={onRefreshStatus}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              I've Verified My Email
            </Button>
          </div>

          {/* Update email section */}
          <div className="pt-2">
            {!showUpdateForm ? (
              <button
                onClick={() => setShowUpdateForm(true)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Made a typo? <span className="underline">Update your email address</span>
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
