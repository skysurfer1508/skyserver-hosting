import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminRequests } from '@/hooks/useAdminRequests';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Users,
  Server,
  Check,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Gamepad2,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type RequestStatus = Database['public']['Enums']['request_status'];

const gameLabels: Record<string, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
};

export default function Admin() {
  const { requests, isLoading: requestsLoading, approveRequest, rejectRequest, deleteRequest } = useAdminRequests();
  const { settings, activeSlots, isLoading: settingsLoading, updateSettings, refetch: refetchSettings } = useSystemSettings();
  const { gameLimits, isLoading: gameLimitsLoading, updateGameLimit, refetch: refetchGameLimits } = useGameLimits();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings state
  const [totalSlots, setTotalSlots] = useState(settings?.total_slots?.toString() || '50');
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenance_mode || false);
  const [alertMessage, setAlertMessage] = useState(settings?.global_alert_message || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Game capacity state
  const [editedGameLimits, setEditedGameLimits] = useState<Record<GameName, { maxSlots: number; isActive: boolean }>>({
    minecraft: { maxSlots: 20, isActive: true },
    terraria: { maxSlots: 10, isActive: true },
    satisfactory: { maxSlots: 10, isActive: true },
  });
  const [isSavingGameLimits, setIsSavingGameLimits] = useState(false);

  // Sync settings state when loaded
  useEffect(() => {
    if (settings) {
      setTotalSlots(settings.total_slots.toString());
      setMaintenanceMode(settings.maintenance_mode);
      setAlertMessage(settings.global_alert_message || '');
    }
  }, [settings]);

  // Sync game limits state when loaded
  useEffect(() => {
    if (gameLimits.length > 0) {
      const newState = { ...editedGameLimits };
      gameLimits.forEach((limit) => {
        newState[limit.game_name] = {
          maxSlots: limit.max_slots,
          isActive: limit.is_active,
        };
      });
      setEditedGameLimits(newState);
    }
  }, [gameLimits]);

  const filteredRequests = requests.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const handleApproveClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIpAddress('');
    setPort('');
    setApproveDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequestId || !ipAddress || !port) {
      toast({
        title: 'Missing information',
        description: 'Please enter both IP address and port.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await approveRequest(selectedRequestId, ipAddress, parseInt(port));
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to approve',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Request approved',
      description: 'The server has been activated.',
    });
    setApproveDialogOpen(false);
    refetchSettings();
  };

  const handleReject = async (requestId: string) => {
    setIsSubmitting(true);
    const { error } = await rejectRequest(requestId);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to reject',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Request rejected',
      description: 'The server request has been rejected.',
    });
  };

  const handleDelete = async (requestId: string) => {
    setIsSubmitting(true);
    const { error } = await deleteRequest(requestId);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Request deleted',
      description: 'The server request has been removed.',
    });
    refetchSettings();
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await updateSettings({
      total_slots: parseInt(totalSlots) || 50,
      maintenance_mode: maintenanceMode,
      global_alert_message: alertMessage.trim() || null,
    });
    setIsSavingSettings(false);

    if (error) {
      toast({
        title: 'Failed to save settings',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Settings saved',
      description: 'System settings have been updated.',
    });
    refetchSettings();
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-success/20 text-success border-success/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage server requests and system settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Requests Table */}
          <div className="lg:col-span-2">
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Server Requests
                    </CardTitle>
                    <CardDescription>
                      Manage user server requests
                    </CardDescription>
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as RequestStatus | 'all')}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No requests found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Discord</TableHead>
                          <TableHead>Game</TableHead>
                          <TableHead>Server</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => {
                          const game = gameLabels[request.game_type];
                          return (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.user_email || 'Unknown'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {request.discord_username || '-'}
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-2">
                                  <span>{game?.icon}</span>
                                  <span>{game?.label}</span>
                                </span>
                              </TableCell>
                              <TableCell>{request.server_name}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {request.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-success hover:text-success hover:bg-success/10"
                                        onClick={() => handleApproveClick(request.id)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleReject(request.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(request.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Game Capacity Management */}
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  Game Capacity
                </CardTitle>
                <CardDescription>
                  Manage per-game slot limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameLimitsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  gameLimits.map((limit) => {
                    const game = gameLabels[limit.game_name];
                    const edited = editedGameLimits[limit.game_name];
                    const percentage = limit.max_slots > 0
                      ? Math.min(100, (limit.used_slots / limit.max_slots) * 100)
                      : 0;

                    return (
                      <div key={limit.game_name} className="space-y-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{game?.icon}</span>
                          <span className="font-medium">{game?.label}</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                'h-full transition-all duration-500',
                                limit.is_full ? 'bg-destructive' : 'bg-primary'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {limit.used_slots} / {limit.max_slots} active
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Max Slots</Label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={edited?.maxSlots ?? limit.max_slots}
                              onChange={(e) =>
                                setEditedGameLimits((prev) => ({
                                  ...prev,
                                  [limit.game_name]: {
                                    ...prev[limit.game_name],
                                    maxSlots: parseInt(e.target.value) || 1,
                                  },
                                }))
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="flex items-end justify-end">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Active</Label>
                              <Switch
                                checked={edited?.isActive ?? limit.is_active}
                                onCheckedChange={(checked) =>
                                  setEditedGameLimits((prev) => ({
                                    ...prev,
                                    [limit.game_name]: {
                                      ...prev[limit.game_name],
                                      isActive: checked,
                                    },
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    setIsSavingGameLimits(true);
                    for (const gameName of Object.keys(editedGameLimits) as GameName[]) {
                      const edited = editedGameLimits[gameName];
                      await updateGameLimit(gameName, edited.maxSlots, edited.isActive);
                    }
                    setIsSavingGameLimits(false);
                    toast({
                      title: 'Game limits saved',
                      description: 'Capacity settings have been updated.',
                    });
                    refetchGameLimits();
                  }}
                  disabled={isSavingGameLimits}
                >
                  {isSavingGameLimits ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Game Limits'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSlots">Total Slots (Legacy)</Label>
                  <Input
                    id="totalSlots"
                    type="number"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    min={1}
                    max={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use Game Capacity above for per-game limits
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Disable new server requests
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertMessage">Global Alert Message</Label>
                  <Textarea
                    id="alertMessage"
                    placeholder="Enter a message to display to all users..."
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full glow-primary"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="gaming-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Approve Server Request</DialogTitle>
            <DialogDescription>
              Assign an IP address and port to activate this server
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                placeholder="192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="25565"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                min={1}
                max={65535}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveSubmit}
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
