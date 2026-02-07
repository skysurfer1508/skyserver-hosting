import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export function MaintenanceBanner() {
  const { settings, isFull, activeSlots, isLoading } = useSystemSettings();

  if (isLoading) return null;

  return (
    <>
      {settings?.maintenance_mode && (
        <Alert className="rounded-none border-0 border-b bg-warning/20 text-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            🚧 Maintenance Mode: New server requests are currently disabled.
          </AlertDescription>
        </Alert>
      )}
      
      {settings?.global_alert_message && (
        <Alert className="rounded-none border-0 border-b bg-primary/20 text-primary">
          <AlertDescription className="ml-2">
            📢 {settings.global_alert_message}
          </AlertDescription>
        </Alert>
      )}
      
      {isFull && !settings?.maintenance_mode && (
        <Alert className="rounded-none border-0 border-b bg-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            ❌ We are currently at full capacity ({activeSlots}/{settings?.total_slots} slots). 
            Please try again later or open a ticket on Discord.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
