import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminOfflineBanner() {
  return (
    <Alert className="mb-4 border-warning/50 bg-warning/10 text-warning-foreground">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="ml-2 text-sm font-medium text-foreground">
        ⚠️ The Admin is currently offline. Server requests may take up to 48 hours to process.
      </AlertDescription>
    </Alert>
  );
}
