import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ServerExpiryCardProps {
  requestId: string;
  expiresAt: string | null;
  onRenewed: () => void;
}

export function ServerExpiryCard({ requestId, expiresAt, onRenewed }: ServerExpiryCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    total: number;
  } | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    if (expiresAt === null) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, total: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes, total: diff });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const { data, error } = await supabase.rpc('renew_server_lease', {
        request_id: requestId,
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Server renewed!',
          description: 'Your server has been renewed for 7 days.',
        });
        onRenewed();
      } else {
        toast({
          title: 'Renewal failed',
          description: 'Unable to renew server. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error renewing server:', error);
      toast({
        title: 'Error',
        description: 'Failed to renew server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRenewing(false);
    }
  };

  // Permanent server — no expiry
  if (expiresAt === null) {
    return (
      <Card className="gaming-card bg-primary/10 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Server Lease Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-primary">Permanent Server</div>
            <p className="text-sm text-muted-foreground mt-1">This server does not expire</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeRemaining) return null;

  const daysRemaining = timeRemaining.days;
  const isUrgent = daysRemaining < 3;
  const canRenew = daysRemaining < 3;

  const getStatusColor = () => {
    if (daysRemaining >= 3) return 'text-green-500';
    if (daysRemaining >= 1) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBg = () => {
    if (daysRemaining >= 3) return 'bg-green-500/10 border-green-500/30';
    if (daysRemaining >= 1) return 'bg-warning/10 border-warning/30';
    return 'bg-destructive/10 border-destructive/30';
  };

  return (
    <Card className={cn('gaming-card', getStatusBg())}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className={cn('h-5 w-5', getStatusColor())} />
          Server Lease Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={cn('text-3xl font-bold', getStatusColor())}>
            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isUrgent ? 'Renewal required soon!' : 'Time remaining until expiry'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Expires</span>
            <span>{new Date(expiresAt).toLocaleDateString()}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                daysRemaining >= 3 ? 'bg-success' : daysRemaining >= 1 ? 'bg-warning' : 'bg-destructive'
              )}
              style={{ width: `${Math.min((daysRemaining / 7) * 100, 100)}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleRenew}
          disabled={!canRenew || isRenewing}
          className="w-full"
          variant={canRenew ? 'default' : 'secondary'}
        >
          {isRenewing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Renewing...
            </>
          ) : canRenew ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Renew Server (7 days)
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Renewal available in {daysRemaining - 2} days
            </>
          )}
        </Button>

        {!canRenew && (
          <p className="text-xs text-center text-muted-foreground">
            You can renew when less than 3 days remain
          </p>
        )}
      </CardContent>
    </Card>
  );
}
