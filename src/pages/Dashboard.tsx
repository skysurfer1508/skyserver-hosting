import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MaintenanceBanner } from '@/components/dashboard/MaintenanceBanner';
import { ServerStatusCard } from '@/components/dashboard/ServerStatusCard';
import { PlatformStatusCard } from '@/components/dashboard/PlatformStatusCard';
import { PlatformStatusBanner } from '@/components/dashboard/PlatformStatusBanner';
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';
import { FeedbackWidget } from '@/components/dashboard/FeedbackWidget';
import { ProfileCompletionModal } from '@/components/dashboard/ProfileCompletionModal';
import { EmailVerificationModal } from '@/components/dashboard/EmailVerificationModal';
import { AdminOfflineBanner } from '@/components/dashboard/AdminOfflineBanner';
import { NewsFeed } from '@/components/NewsFeed';
import { useAuth } from '@/hooks/useAuth';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { usePlatformStatus } from '@/hooks/usePlatformStatus';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Server, Settings, Loader2 } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/config/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useSystemSettings();
  const { status, panelOnline, nodeOnline, lastChecked, refresh } = usePlatformStatus();
  const { isProfileIncomplete, isChecking, markComplete } = useProfileCompletion();
  const { 
    isEmailVerified, 
    isChecking: isCheckingEmail, 
    userEmail,
    isResending,
    isUpdatingEmail,
    resendVerificationEmail,
    updateEmail,
    refreshStatus: refreshEmailStatus,
  } = useEmailVerification();
  const { isAdminOnline } = useAdminStatus();
  const [activeTab, setActiveTab] = useState('server');

  // Show loading state while checking profile or email verification
  if (isChecking || isCheckingEmail) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      {/* Email Verification Modal - blocks access until email is verified */}
      <EmailVerificationModal
        open={!isEmailVerified}
        userEmail={userEmail}
        isResending={isResending}
        isUpdatingEmail={isUpdatingEmail}
        onResendEmail={resendVerificationEmail}
        onUpdateEmail={updateEmail}
        onRefreshStatus={refreshEmailStatus}
      />

      {/* Profile Completion Modal - blocks access until name is provided */}
      <ProfileCompletionModal open={isProfileIncomplete} onComplete={markComplete} />

      {/* Platform Status Banner (only shows if NOT online) */}
      <PlatformStatusBanner 
        status={status} 
        panelOnline={panelOnline} 
        nodeOnline={nodeOnline}
        onRefresh={refresh}
      />
      
      <MaintenanceBanner />
      
      <div className="container py-8">
        {/* Admin Offline Banner */}
        {!isAdminOnline && <AdminOfflineBanner />}
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome, <span className="text-primary">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your game server from this dashboard
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="server" className="gap-2 data-[state=active]:bg-primary/10">
              <Server className="h-4 w-4" />
              Server
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/10">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Server Tab */}
          <TabsContent value="server" className="mt-6">
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

                {/* News Feed */}
                <NewsFeed limit={5} maxHeight="250px" />

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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <DashboardSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Feedback Widget */}
      <FeedbackWidget />
    </Layout>
  );
}
