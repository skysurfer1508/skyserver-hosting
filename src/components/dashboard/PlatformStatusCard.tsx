import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { PlatformStatus } from '@/hooks/usePlatformStatus';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PlatformStatusCardProps {
  status: PlatformStatus;
  panelOnline: boolean;
  nodeOnline: boolean;
  lastChecked: Date | null;
  maintenanceMode?: boolean;
  onRefresh?: () => void;
}

const statusConfig = {
  online: {
    label: 'Online',
    color: 'text-success',
    bgColor: 'bg-success',
    icon: CheckCircle2,
  },
  partial: {
    label: 'Partial Outage',
    color: 'text-warning',
    bgColor: 'bg-warning',
    icon: AlertTriangle,
  },
  offline: {
    label: 'Offline',
    color: 'text-destructive',
    bgColor: 'bg-destructive',
    icon: XCircle,
  },
  checking: {
    label: 'Checking...',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: Loader2,
  },
};

export function PlatformStatusCard({
  status,
  panelOnline,
  nodeOnline,
  lastChecked,
  maintenanceMode,
  onRefresh,
}: PlatformStatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Platform Status
          </CardTitle>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded hover:bg-accent transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={cn(
                "h-3.5 w-3.5 text-muted-foreground",
                status === 'checking' && 'animate-spin'
              )} />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={cn("flex items-center gap-2 text-sm font-medium", config.color)}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              config.bgColor,
              status === 'online' && 'animate-pulse',
              status === 'checking' && 'animate-pulse'
            )} />
            {config.label}
          </span>
        </div>

        {/* Individual Services */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Control Panel</span>
            <span className={cn(
              "flex items-center gap-1.5",
              status === 'checking' ? 'text-muted-foreground' : panelOnline ? 'text-success' : 'text-destructive'
            )}>
              {status === 'checking' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : panelOnline ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {status === 'checking' ? 'Checking' : panelOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Game Node</span>
            <span className={cn(
              "flex items-center gap-1.5",
              status === 'checking' ? 'text-muted-foreground' : nodeOnline ? 'text-success' : 'text-destructive'
            )}>
              {status === 'checking' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : nodeOnline ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {status === 'checking' ? 'Checking' : nodeOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Maintenance Status */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Maintenance</span>
          <span className="text-sm">
            {maintenanceMode ? (
              <span className="text-warning">Active</span>
            ) : (
              <span className="text-success">None</span>
            )}
          </span>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <p className="text-xs text-muted-foreground/70 text-right">
            Last checked: {formatDistanceToNow(lastChecked, { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
