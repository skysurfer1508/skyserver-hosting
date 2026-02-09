import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Loader2, CheckCircle } from 'lucide-react';

interface ProfileCompletionModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ProfileCompletionModal({ open, onComplete }: ProfileCompletionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !fullName.trim()) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your name. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Profile updated!',
      description: 'Welcome to SkyServer!',
    });

    onComplete();
  };

  const isValid = fullName.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md gaming-card border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
            <User className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl">
            Please Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-base">
            We now require a Full Name for all users. This helps us personalize your experience 
            and improve our support communications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 text-base"
              autoFocus
              minLength={2}
              maxLength={100}
            />
            {fullName.length > 0 && fullName.trim().length < 2 && (
              <p className="text-sm text-destructive">
                Name must be at least 2 characters
              </p>
            )}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!isValid || isSaving}
            className="w-full h-12 text-base gap-2 glow-primary"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
