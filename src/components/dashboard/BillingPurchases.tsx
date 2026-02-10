import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, MemoryStick, Cpu, Loader2, PackageOpen } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ServerRequest = Tables<'server_requests'>;

interface CancelState {
  [serverId: string]: {
    cancelAt?: string;
    loading?: boolean;
  };
}

export function BillingPurchases() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<ServerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelState, setCancelState] = useState<CancelState>({});
  const [confirmServerId, setConfirmServerId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSubscriptions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('server_requests')
        .select('*')
        .eq('user_id', user.id)
        .not('stripe_subscription_id', 'is', null);

      if (error) {
        toast({ title: 'Error', description: 'Failed to load subscriptions.', variant: 'destructive' });
      } else {
        setSubscriptions(data || []);
      }
      setLoading(false);
    };
    fetchSubscriptions();
  }, [user]);

  const handleCancel = async (serverId: string) => {
    setConfirmServerId(null);
    setCancelState((prev) => ({ ...prev, [serverId]: { ...prev[serverId], loading: true } }));

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { serverId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const cancelAt = data.cancel_at
        ? new Date(data.cancel_at * 1000).toISOString()
        : undefined;

      setCancelState((prev) => ({
        ...prev,
        [serverId]: { cancelAt, loading: false },
      }));

      toast({ title: 'Subscription canceling', description: `Your boosts will remain active until ${cancelAt ? new Date(cancelAt).toLocaleDateString() : 'the end of the billing period'}.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to cancel subscription.', variant: 'destructive' });
      setCancelState((prev) => ({ ...prev, [serverId]: { ...prev[serverId], loading: false } }));
    }
  };

  const confirmTarget = subscriptions.find((s) => s.id === confirmServerId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card className="gaming-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Active Subscriptions</h3>
          <p className="text-sm text-muted-foreground">You don't have any resource upgrades yet. You can purchase boosts from the Server Upgrade page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((sub) => {
          const ramGB = (sub.ram_boost || 0) / 1024;
          const cpu = sub.cpu_boost || 0;
          const state = cancelState[sub.id];
          const isCanceling = !!state?.cancelAt;
          const isLoading = !!state?.loading;

          return (
            <Card key={sub.id} className="gaming-card border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                      {sub.server_name}
                    </CardTitle>
                    <CardDescription className="capitalize">{sub.game_type}</CardDescription>
                  </div>
                  {isCanceling ? (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                      Canceling on {new Date(state.cancelAt!).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <Badge className="bg-success/20 text-success border-success/30">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {ramGB > 0 && (
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <MemoryStick className="h-3 w-3" />
                        Extra RAM
                      </div>
                      <p className="font-bold text-foreground">+{ramGB} GB</p>
                    </div>
                  )}
                  {cpu > 0 && (
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Cpu className="h-3 w-3" />
                        Extra CPU
                      </div>
                      <p className="font-bold text-foreground">+{cpu}%</p>
                    </div>
                  )}
                </div>

                {!isCanceling && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => setConfirmServerId(sub.id)}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!confirmServerId} onOpenChange={(open) => !open && setConfirmServerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the resource upgrade for <strong>{confirmTarget?.server_name}</strong>? You will keep your boosts until the end of the current billing period, then they will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmServerId && handleCancel(confirmServerId)}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
