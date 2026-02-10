import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Users,
  Check,
  X,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type RequestStatus = Database['public']['Enums']['request_status'];

const gameLabels: Record<string, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
};

// Helper function to calculate and format time remaining
const getExpiryInfo = (expiresAt: string | null) => {
  if (!expiresAt) return { text: 'Permanent', isUrgent: false, isExpired: false, isPermanent: true, days: Infinity };
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { text: 'Expired', isUrgent: true, isExpired: true, isPermanent: false, days: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days === 0) {
    return { text: `${hours}h`, isUrgent: true, isExpired: false, isPermanent: false, days: 0 };
  }
  
  return { 
    text: `${days}d ${hours}h`, 
    isUrgent: days < 3, 
    isExpired: false,
    isPermanent: false,
    days 
  };
};

export function AdminRequests() {
  const { requests, isLoading, approveRequest, rejectRequest, deleteRequest } = useAdminRequests();
  const { refetch: refetchSettings } = useSystemSettings();
  const { refetch: refetchGameLimits } = useGameLimits();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [assignedIp, setAssignedIp] = useState('');
  const [panelUrl, setPanelUrl] = useState('https://panel.skyserver1508.org');
  const [panelUsername, setPanelUsername] = useState('');
  const [panelPassword, setPanelPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = requests.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const handleApproveClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setAssignedIp('');
    setPanelUrl('https://panel.skyserver1508.org');
    setPanelUsername('');
    setPanelPassword('');
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
      toast({
        title: 'Missing information',
        description: 'Please enter the server IP address.',
        variant: 'destructive',
      });
      return;
    }

    if (!panelUsername.trim() || !panelPassword.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter panel username and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await approveRequest(selectedRequest.id, {
      assignedIp: assignedIp.trim(),
      panelUrl: panelUrl.trim(),
      panelUsername: panelUsername.trim(),
      panelPassword: panelPassword.trim(),
    });
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
      title: 'Server activated',
      description: `Server for ${selectedRequest.user_email} has been activated.`,
    });
    setApproveDialogOpen(false);
    setSelectedRequest(null);
    refetchSettings();
    refetchGameLimits();
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedRequest) return;

    const { error } = await rejectRequest(selectedRequest.id, reason);

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
    setSelectedRequest(null);
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
    <>
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
          {isLoading ? (
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
                    <TableHead>Expires</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRequests.map((request) => {
                    const game = gameLabels[request.game_type];
                    const expiryInfo = request.status === 'active' ? getExpiryInfo(request.expires_at) : null;
                    
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
                        <TableCell>
                          {request.status === 'active' && expiryInfo ? (
                            expiryInfo.isPermanent ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                                ∞ Permanent
                              </Badge>
                            ) : (
                              <div className={cn(
                                'flex items-center gap-1 text-sm font-medium',
                                expiryInfo.isExpired 
                                  ? 'text-destructive' 
                                  : expiryInfo.isUrgent 
                                    ? 'text-warning' 
                                    : 'text-success'
                              )}>
                                {expiryInfo.isUrgent && (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {expiryInfo.text}
                              </div>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
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
            <DialogDescription>
              Enter the server credentials for {selectedRequest?.server_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignedIp">Server IP Address *</Label>
              <Input
                id="assignedIp"
                placeholder="192.168.1.1:25565"
                value={assignedIp}
                onChange={(e) => setAssignedIp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panelUrl">Panel URL</Label>
              <Input
                id="panelUrl"
                placeholder="https://panel.skyserver1508.org"
                value={panelUrl}
                onChange={(e) => setPanelUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panelUsername">Panel Username *</Label>
                <Input
                  id="panelUsername"
                  placeholder="username"
                  value={panelUsername}
                  onChange={(e) => setPanelUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panelPassword">Panel Password *</Label>
                <Input
                  id="panelPassword"
                  type="password"
                  placeholder="••••••••"
                  value={panelPassword}
                  onChange={(e) => setPanelPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveSubmit} disabled={isSubmitting} className="glow-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Server'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <RejectModal
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        serverName={selectedRequest?.server_name || ''}
      />

      {/* Details Modal */}
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
