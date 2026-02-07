import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

export function SecuritySettingsCard() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (): string | null => {
    if (!newPassword) return 'Please enter a new password.';
    if (newPassword.length < 6) return 'Password must be at least 6 characters long.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleUpdatePassword = async () => {
    const error = validatePassword();
    if (error) {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsUpdating(false);

    if (updateError) {
      toast({
        title: 'Error',
        description: updateError.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      // Clear the fields
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters long.
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password match indicator */}
        {confirmPassword && (
          <div className={`text-sm ${newPassword === confirmPassword ? 'text-success' : 'text-destructive'}`}>
            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </div>
        )}

        {/* Update Button */}
        <Button 
          onClick={handleUpdatePassword} 
          disabled={isUpdating || !newPassword || !confirmPassword}
          className="w-full gap-2"
          variant="outline"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Update Password
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
