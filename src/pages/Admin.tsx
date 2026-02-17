import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminRequests } from '@/components/admin/AdminRequests';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminAnnouncements } from '@/components/admin/AdminAnnouncements';
import { AdminFeedback } from '@/components/admin/AdminFeedback';
import { AdminUpgrades } from '@/components/admin/AdminUpgrades';
import { AdminStatusToggle } from '@/components/admin/AdminStatusToggle';
import { LayoutDashboard, ListTodo, Users, Settings, Megaphone, Inbox, Zap } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Admin() {
  usePageTitle('Admin - SkyServer');
  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Command Center
            </h1>
            <p className="text-muted-foreground">
              Manage servers, users, and system settings
            </p>
          </div>
          <AdminStatusToggle />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto lg:w-[700px]">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Upgrades</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="requests">
            <AdminRequests />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="news">
            <AdminAnnouncements />
          </TabsContent>

          <TabsContent value="feedback">
            <AdminFeedback />
          </TabsContent>

          <TabsContent value="upgrades">
            <AdminUpgrades />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
