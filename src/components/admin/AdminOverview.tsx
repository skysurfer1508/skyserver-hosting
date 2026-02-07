import { useAdminStats } from '@/hooks/useAdminStats';
import { StatCard } from './StatCard';
import { SlotUsageChart } from './SlotUsageChart';
import { Users, Server, Clock, Loader2 } from 'lucide-react';

export function AdminOverview() {
  const { stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
