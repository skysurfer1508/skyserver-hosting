import { Layout } from '@/components/layout/Layout';
import { MaintenanceBanner } from '@/components/dashboard/MaintenanceBanner';
import { ServerStatusCard } from '@/components/dashboard/ServerStatusCard';
import { useAuth } from '@/hooks/useAuth';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  return (
    <Layout showFooter={false}>
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
            <Card className="gaming-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2 text-sm text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Maintenance</span>
                  <span className="text-sm">
                    {settings?.maintenance_mode ? (
                      <span className="text-warning">Active</span>
                    ) : (
                      <span className="text-success">None</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

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
                  href="https://discord.gg/skyserver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-center text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
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
