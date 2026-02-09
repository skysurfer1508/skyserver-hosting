import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminStatusToggle() {
  const { isAdminOnline, isLoading, updateStatus } = useAdminStatus();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(isAdminOnline);

  useEffect(() => {
    setLocalStatus(isAdminOnline);
  }, [isAdminOnline]);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    setLocalStatus(checked);

    const { error } = await updateStatus(checked);
    setIsUpdating(false);

    if (error) {
      setLocalStatus(!checked); // Revert on error
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: checked ? 'You are now online' : 'You are now offline',
      description: checked
        ? 'Users will see you as available.'
        : 'Users will see a notice that requests may take longer.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading status...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-2">
      <div className="flex items-center gap-2">
        {localStatus ? (
          <Wifi className="h-4 w-4 text-primary" />
        ) : (
          <WifiOff className="h-4 w-4 text-warning" />
        )}
        <Label
          htmlFor="admin-status"
          className={cn(
            'text-sm font-medium cursor-pointer',
            localStatus ? 'text-primary' : 'text-warning'
          )}
        >
          {localStatus ? 'Online' : 'Offline'}
        </Label>
      </div>
      <Switch
        id="admin-status"
        checked={localStatus}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-warning"
      />
    </div>
  );
}
