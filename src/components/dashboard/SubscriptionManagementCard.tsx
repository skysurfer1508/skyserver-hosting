import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServerRequest } from '@/hooks/useServerRequest';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ExternalLink, Loader2, MemoryStick, Cpu } from 'lucide-react';

export function SubscriptionManagementCard() {
  const { request } = useServerRequest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Only show if user has an active subscription
  if (!request?.stripe_subscription_id) return null;

  const ramBoostGB = (request.ram_boost || 0) / 1024;
  const cpuBoost = request.cpu_boost || 0;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open subscription portal.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Resource Subscription
        </CardTitle>
        <CardDescription>Manage your server resource upgrades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-success/20 text-success border-success/30">Active</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ramBoostGB > 0 && (
            <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <MemoryStick className="h-3 w-3" />
                Extra RAM
              </div>
              <p className="font-bold">+{ramBoostGB} GB</p>
            </div>
          )}
          {cpuBoost > 0 && (
            <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Cpu className="h-3 w-3" />
                Extra CPU
              </div>
              <p className="font-bold">+{cpuBoost}%</p>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleManageSubscription}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Manage Subscription
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
