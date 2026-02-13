import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Gamepad2, AlertTriangle, Loader2, Save, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const gameLabels: Record<string, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
  cs2: { label: 'Counter-Strike 2', icon: '🔫' },
  factorio: { label: 'Factorio', icon: '⚙️' },
  rust: { label: 'Rust', icon: '🔥' },
};

export function AdminSettings() {
  const { settings, isLoading: settingsLoading, updateSettings, refetch: refetchSettings } = useSystemSettings();
  const { gameLimits, isLoading: gameLimitsLoading, updateGameLimit, refetch: refetchGameLimits } = useGameLimits();
  const { session } = useAuth();
  const { toast } = useToast();
  const [isResettingVerification, setIsResettingVerification] = useState(false);

  // Settings state
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenance_mode || false);
  const [alertMessage, setAlertMessage] = useState(settings?.global_alert_message || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Game capacity state
  const [editedGameLimits, setEditedGameLimits] = useState<Record<GameName, { maxSlots: number; isActive: boolean; baseRamMb: number; baseCpuPercent: number }>>({
    minecraft: { maxSlots: 20, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
    terraria: { maxSlots: 10, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
    satisfactory: { maxSlots: 10, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
    cs2: { maxSlots: 10, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
    factorio: { maxSlots: 10, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
    rust: { maxSlots: 10, isActive: true, baseRamMb: 2560, baseCpuPercent: 100 },
  });
  const [isSavingGameLimits, setIsSavingGameLimits] = useState(false);

  // Sync settings state when loaded
  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode);
      setAlertMessage(settings.global_alert_message || '');
    }
  }, [settings]);

  // Sync game limits state when loaded
  useEffect(() => {
    if (gameLimits.length > 0) {
      const newState = { ...editedGameLimits };
      gameLimits.forEach((limit) => {
        newState[limit.game_name] = {
          maxSlots: limit.max_slots,
          isActive: limit.is_active,
          baseRamMb: limit.base_ram_mb,
          baseCpuPercent: limit.base_cpu_percent,
        };
      });
      setEditedGameLimits(newState);
    }
  }, [gameLimits]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await updateSettings({
      maintenance_mode: maintenanceMode,
      global_alert_message: alertMessage.trim() || null,
    });
    setIsSavingSettings(false);

    if (error) {
      toast({
        title: 'Failed to save settings',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Settings saved',
      description: 'System settings have been updated.',
    });
    refetchSettings();
  };

  const handleSaveGameLimits = async () => {
    setIsSavingGameLimits(true);
    let hasError = false;

    for (const [gameName, values] of Object.entries(editedGameLimits)) {
      const { error } = await updateGameLimit(
        gameName as GameName,
        values.maxSlots,
        values.isActive,
        values.baseRamMb,
        values.baseCpuPercent
      );

      if (error) {
        hasError = true;
        toast({
          title: `Failed to update ${gameName}`,
          description: error.message,
          variant: 'destructive',
        });
      }
    }

    setIsSavingGameLimits(false);

    if (!hasError) {
      toast({
        title: 'Game capacity saved',
        description: 'Game slot limits have been updated.',
      });
      refetchGameLimits();
    }
  };

  const isLoading = settingsLoading || gameLimitsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Capacity Management */}
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Capacity Management
          </CardTitle>
          <CardDescription>
            Manage per-game slot limits and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameLimits.map((limit) => {
            const game = gameLabels[limit.game_name];
            const edited = editedGameLimits[limit.game_name];
            const percentage = limit.max_slots > 0
              ? Math.min(100, (limit.used_slots / limit.max_slots) * 100)
              : 0;

            return (
              <div key={limit.game_name} className="space-y-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{game?.icon}</span>
                    <span className="font-medium">{game?.label}</span>
                  </div>
                  <Switch
                    checked={edited?.isActive ?? limit.is_active}
                    onCheckedChange={(checked) =>
                      setEditedGameLimits((prev) => ({
                        ...prev,
                        [limit.game_name]: {
                          ...prev[limit.game_name],
                          isActive: checked,
                        },
                      }))
                    }
                  />
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        limit.is_full ? 'bg-destructive' : 'bg-primary'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {limit.used_slots} / {limit.max_slots} active
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Max Slots</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={edited?.maxSlots ?? limit.max_slots}
                    onChange={(e) =>
                      setEditedGameLimits((prev) => ({
                        ...prev,
                        [limit.game_name]: {
                          ...prev[limit.game_name],
                          maxSlots: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    className="h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Base RAM (MB)</Label>
                    <Input
                      type="number"
                      min={512}
                      max={32768}
                      step={512}
                      value={edited?.baseRamMb ?? limit.base_ram_mb}
                      onChange={(e) =>
                        setEditedGameLimits((prev) => ({
                          ...prev,
                          [limit.game_name]: {
                            ...prev[limit.game_name],
                            baseRamMb: parseInt(e.target.value) || 2560,
                          },
                        }))
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Base CPU (%)</Label>
                    <Input
                      type="number"
                      min={50}
                      max={800}
                      step={50}
                      value={edited?.baseCpuPercent ?? limit.base_cpu_percent}
                      onChange={(e) =>
                        setEditedGameLimits((prev) => ({
                          ...prev,
                          [limit.game_name]: {
                            ...prev[limit.game_name],
                            baseCpuPercent: parseInt(e.target.value) || 100,
                          },
                        }))
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleSaveGameLimits}
            disabled={isSavingGameLimits}
            className="w-full glow-primary"
          >
            {isSavingGameLimits ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Capacity
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* System Announcements */}
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            System Announcements
          </CardTitle>
          <CardDescription>
            Configure maintenance mode and global alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="font-medium">Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">
                Disables new server requests when enabled
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              className="data-[state=checked]:bg-warning"
            />
          </div>

          {/* Global Alert Message */}
          <div className="space-y-2">
            <Label htmlFor="alertMessage">Global Alert Message</Label>
            <Textarea
              id="alertMessage"
              placeholder="Enter a message to display to all users..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              This message will appear as a banner on all pages
            </p>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="w-full glow-primary"
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Force Re-Verification */}
      <Card className="gaming-card border-destructive/30 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Force Re-Verification (Danger Zone)
          </CardTitle>
          <CardDescription>
            Reset email verification for all non-admin users. They will need to re-verify their email before accessing the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isResettingVerification}>
                {isResettingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Force All Users to Re-Verify
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset email verification for ALL non-admin users. They will be blocked from the dashboard until they re-verify their email address. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    setIsResettingVerification(true);
                    try {
                      const response = await supabase.functions.invoke('reset-all-verification', {
                        headers: {
                          Authorization: `Bearer ${session?.access_token}`,
                        },
                      });
                      if (response.error) throw response.error;
                      const data = response.data;
                      toast({
                        title: 'Verification reset complete',
                        description: `${data.resetCount} user(s) must now re-verify their email.`,
                      });
                    } catch (err: any) {
                      toast({
                        title: 'Failed to reset verification',
                        description: err.message,
                        variant: 'destructive',
                      });
                    }
                    setIsResettingVerification(false);
                  }}
                >
                  Yes, Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
