import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { useAdminRequests } from '@/hooks/useAdminRequests';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useGameLimits } from '@/hooks/useGameLimits';
import { useToast } from '@/hooks/use-toast';
import { RejectModal } from './RejectModal';
import { RequestDetailsModal } from './RequestDetailsModal';
import { Inbox, Check, X, Trash2, Loader2, Eye, Search } from 'lucide-react';
import { gameLabels, getStatusBadge, isAutoExpiredServer, matchesSearch } from './requestsShared';
import { Database } from '@/integrations/supabase/types';

type RequestStatus = Database['public']['Enums']['request_status'];

export function AdminRequests() {
  const { requests, isLoading, approveRequest, rejectRequest, deleteRequest } = useAdminRequests();
  const { refetch: refetchSettings } = useSystemSettings();
  const { refetch: refetchGameLimits } = useGameLimits();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [assignedIp, setAssignedIp] = useState('');
  const [panelUrl, setPanelUrl] = useState('https://panel.skyserver1508.org');
  const [panelUsername, setPanelUsername] = useState('');
  const [panelPassword, setPanelPassword] = useState('');
  const [pterodactylServerId, setPterodactylServerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only pending or rejected requests (exclude auto-expired — those live on the Servers tab)
  const baseRequests = requests.filter(
    (r) => (r.status === 'pending' || r.status === 'rejected') && !isAutoExpiredServer(r)
  );

  const filteredRequests = baseRequests
    .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
    .filter((r) => matchesSearch(r, search));

  const handleApproveClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setAssignedIp('');
    setPanelUrl('https://panel.skyserver1508.org');
    setPanelUsername('');
    setPanelPassword('');
    setPterodactylServerId('');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleRowClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest) return;
    if (!assignedIp.trim()) {
      toast({ title: 'Missing information', description: 'Please enter the server IP address.', variant: 'destructive' });
      return;
    }
    if (!panelUsername.trim() || !panelPassword.trim()) {
      toast({ title: 'Missing information', description: 'Please enter panel username and password.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const { error } = await approveRequest(selectedRequest.id, {
      assignedIp: assignedIp.trim(),
      panelUrl: panelUrl.trim(),
      panelUsername: panelUsername.trim(),
      panelPassword: panelPassword.trim(),
      pterodactylServerId: pterodactylServerId.trim() ? parseInt(pterodactylServerId.trim(), 10) : undefined,
    });
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Failed to approve', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Server activated', description: `Server for ${selectedRequest.user_email} has been activated.` });
    setApproveDialogOpen(false);
    setSelectedRequest(null);
    refetchSettings();
    refetchGameLimits();
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedRequest) return;
    const { error } = await rejectRequest(selectedRequest.id, reason);
    if (error) {
      toast({ title: 'Failed to reject', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Request rejected', description: 'The server request has been rejected.' });
    setSelectedRequest(null);
  };

  const handleDelete = async (requestId: string) => {
    setIsSubmitting(true);
    const { error } = await deleteRequest(requestId);
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Request deleted', description: 'The server request has been removed.' });
    refetchSettings();
  };

  return (
    <>
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-primary" />
                Server Requests
              </CardTitle>
              <CardDescription>Pending and rejected server requests</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:w-[240px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
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
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(request)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {request.user_email || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{request.discord_username || '-'}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span>{game?.icon}</span>
                            <span>{game?.label}</span>
                          </span>
                        </TableCell>
                        <TableCell>{request.server_name}</TableCell>
                        <TableCell>{getStatusBadge(request)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-success hover:text-success hover:bg-success/10"
                                  onClick={() => handleApproveClick(request)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRejectClick(request)}
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="gaming-card border-border/50">
          <DialogHeader>
            <DialogTitle>Approve Server Request</DialogTitle>
            <DialogDescription>Enter the server credentials for {selectedRequest?.server_name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignedIp">Server IP Address *</Label>
              <Input id="assignedIp" placeholder="192.168.1.1:25565" value={assignedIp} onChange={(e) => setAssignedIp(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panelUrl">Panel URL</Label>
              <Input id="panelUrl" placeholder="https://panel.skyserver1508.org" value={panelUrl} onChange={(e) => setPanelUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panelUsername">Panel Username *</Label>
                <Input id="panelUsername" placeholder="username" value={panelUsername} onChange={(e) => setPanelUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panelPassword">Panel Password *</Label>
                <Input id="panelPassword" type="password" placeholder="••••••••" value={panelPassword} onChange={(e) => setPanelPassword(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pterodactylServerId">Pterodactyl Server ID (optional)</Label>
              <Input id="pterodactylServerId" type="number" placeholder="e.g. 42" value={pterodactylServerId} onChange={(e) => setPterodactylServerId(e.target.value)} />
              <p className="text-xs text-muted-foreground">The server ID from the Pterodactyl panel. Used for auto-suspend/unsuspend.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApproveSubmit} disabled={isSubmitting} className="glow-primary">
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Activating...</>) : ('Activate Server')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RejectModal
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        serverName={selectedRequest?.server_name || ''}
      />

      <RequestDetailsModal
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        request={selectedRequest}
        onRequestUpdated={() => {
          refetchSettings();
          refetchGameLimits();
        }}
      />
    </>
  );
}
