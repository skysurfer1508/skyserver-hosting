import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { PlatformStatus } from '@/hooks/usePlatformStatus';
import { cn } from '@/lib/utils';

interface PlatformStatusBannerProps {
  status: PlatformStatus;
  panelOnline: boolean;
  nodeOnline: boolean;
  onRefresh?: () => void;
}

export function PlatformStatusBanner({ 
  status, 
  panelOnline, 
  nodeOnline,
  onRefresh 
}: PlatformStatusBannerProps) {
  // Only show banner if status is NOT online
  if (status === 'online' || status === 'checking') {
    return null;
  }

  const isPartial = status === 'partial';
  const isOffline = status === 'offline';

  // Determine which service is down
  let downService = '';
  if (isPartial) {
    if (!panelOnline) downService = 'Control Panel';
    if (!nodeOnline) downService = 'Game Node';
  }

  return (
    <div
      className={cn(
        'w-full py-3 px-4',
        isPartial && 'bg-warning/20 border-b border-warning/30',
        isOffline && 'bg-destructive/20 border-b border-destructive/30'
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isPartial ? (
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive shrink-0" />
          )}
          <p className={cn(
            'text-sm font-medium',
            isPartial && 'text-warning',
            isOffline && 'text-destructive'
          )}>
            <span className="font-bold">System Alert:</span>{' '}
            {isPartial 
              ? `Our ${downService} is currently unreachable. Some features may be limited.`
              : 'Our Game Node and Control Panel are currently unreachable. We are working on it.'
            }
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className={cn(
              'p-1.5 rounded-md transition-colors shrink-0',
              isPartial && 'hover:bg-warning/20 text-warning',
              isOffline && 'hover:bg-destructive/20 text-destructive'
            )}
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
