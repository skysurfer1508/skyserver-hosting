import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, MessageCircle, Loader2, Save } from 'lucide-react';

export function ProfileSettingsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, discord_username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setDisplayName(data.username || '');
        setDiscordUsername(data.discord_username || '');
      }
      setIsLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: displayName.trim() || null,
        discord_username: discordUsername.trim() || null,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="gaming-card border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Display Name
          </Label>
          <Input
            id="displayName"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            id="email"
            value={user?.email || ''}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Your email is used for login and cannot be changed here.
          </p>
        </div>

        {/* Discord Username */}
        <div className="space-y-2">
          <Label htmlFor="discordUsername" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            Discord Username
          </Label>
          <Input
            id="discordUsername"
            placeholder="username#1234 or username"
            value={discordUsername}
            onChange={(e) => setDiscordUsername(e.target.value)}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Used for support and server-related notifications.
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full gap-2 glow-primary"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
