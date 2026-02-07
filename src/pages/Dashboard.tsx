import { Layout } from '@/components/layout/Layout';
import { MaintenanceBanner } from '@/components/dashboard/MaintenanceBanner';
import { ServerStatusCard } from '@/components/dashboard/ServerStatusCard';
import { PlatformStatusCard } from '@/components/dashboard/PlatformStatusCard';
import { PlatformStatusBanner } from '@/components/dashboard/PlatformStatusBanner';
import { useAuth } from '@/hooks/useAuth';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { usePlatformStatus } from '@/hooks/usePlatformStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/config/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useSystemSettings();
  const { status, panelOnline, nodeOnline, lastChecked, refresh } = usePlatformStatus();

  return (
    <Layout showFooter={false}>
      {/* Platform Status Banner (only shows if NOT online) */}
      <PlatformStatusBanner 
        status={status} 
        panelOnline={panelOnline} 
        nodeOnline={nodeOnline}
        onRefresh={refresh}
      />
      
      <MaintenanceBanner />
      
      <div className="container py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome, <span className="text-primary">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your game server from this dashboard
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Server Card */}
          <div className="lg:col-span-2">
            <ServerStatusCard />
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Platform Status */}
            <PlatformStatusCard
              status={status}
              panelOnline={panelOnline}
              nodeOnline={nodeOnline}
              lastChecked={lastChecked}
              maintenanceMode={settings?.maintenance_mode}
              onRefresh={refresh}
            />

            {/* Help Card */}
            <Card className="gaming-card border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">Join our Discord</p>
                  </div>
                </div>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 px-4 py-2 text-center text-sm font-medium text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors"
                >
                  Open Discord
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
