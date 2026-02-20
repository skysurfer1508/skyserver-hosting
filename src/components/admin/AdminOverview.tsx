import { useState } from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { StatCard } from './StatCard';
import { SlotUsageChart } from './SlotUsageChart';
import { Users, Server, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function AdminOverview() {
  const { stats, isLoading } = useAdminStats();
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-pterodactyl-ids');
      if (error) {
        console.error('Pterodactyl sync error:', error);
        toast({ title: 'Sync Failed', description: error.message || 'Unknown error', variant: 'destructive' });
      } else {
        console.log('Pterodactyl sync result:', data);
        if (data?.logs) {
          console.log('--- Sync Logs ---');
          data.logs.forEach((l: string) => console.log(l));
        }
        toast({
          title: 'Sync Complete',
          description: `${data?.synced ?? 0} server(s) synced. Ptero servers: ${data?.ptero_servers ?? 0}. DB requests: ${data?.db_requests ?? 0}.`,
        });
      }
    } catch (err: any) {
      console.error('Sync exception:', err);
      toast({ title: 'Sync Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerSync}
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing…' : 'Force Sync Pterodactyl'}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered accounts"
        />
        <StatCard
          label="Active Servers"
          value={stats.activeServers}
          icon={Server}
          description="Currently running"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          description="Awaiting approval"
        />
        <SlotUsageChart
          used={stats.totalSlotsUsed}
          total={stats.totalSlotsMax}
          percentage={stats.usagePercentage}
        />
      </div>
    </div>
  );
}
