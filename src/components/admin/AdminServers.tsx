import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useGameLimits } from '@/hooks/useGameLimits';
import { useToast } from '@/hooks/use-toast';
import { RequestDetailsModal } from './RequestDetailsModal';
import { Server, Trash2, Loader2, Eye, AlertTriangle, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  gameLabels,
  getExpiryInfo,
  getStatusBadge,
  isAutoExpiredServer,
  isSuspendedServer,
  matchesSearch,
} from './requestsShared';

type ServerFilter = 'all' | 'active' | 'suspended' | 'expired';

export function AdminServers() {
  const { requests, isLoading, deleteRequest, reactivateRequest } = useAdminRequests();
  const { refetch: refetchSettings } = useSystemSettings();
  const { refetch: refetchGameLimits } = useGameLimits();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<ServerFilter>('all');
  const [search, setSearch] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active, suspended, or auto-expired (lease expired) servers
  const baseServers = requests.filter(
    (r) => r.status === 'active' || isSuspendedServer(r) || isAutoExpiredServer(r)
  );

  const filteredServers = baseServers
    .filter((r) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return r.status === 'active';
      if (statusFilter === 'suspended') return isSuspendedServer(r);
      if (statusFilter === 'expired') return isAutoExpiredServer(r);
      return true;
    })
    .filter((r) => matchesSearch(r, search, true));

  const canReactivate = (r: typeof requests[0]) => isAutoExpiredServer(r) || isSuspendedServer(r);

  const handleRowClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleDelete = async (requestId: string) => {
    setIsSubmitting(true);
    const { error } = await deleteRequest(requestId);
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Server deleted', description: 'The server has been removed.' });
    refetchSettings();
  };

  const handleReactivateClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setReactivateDialogOpen(true);
  };

  const handleReactivateConfirm = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    const { error } = await reactivateRequest(selectedRequest.id);
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Failed to reactivate', description: error.message, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Server reactivated',
      description: `Server "${selectedRequest.server_name}" has been reactivated with a fresh 7-day lease.`,
    });
    setReactivateDialogOpen(false);
    setSelectedRequest(null);
    refetchSettings();
    refetchGameLimits();
  };

  return (
    <>
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Servers
              </CardTitle>
              <CardDescription>Approved, suspended, and expired servers</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search servers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:w-[240px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ServerFilter)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
          ) : filteredServers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No servers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServers.map((request) => {
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
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span>{game?.icon}</span>
                            <span>{game?.label}</span>
                          </span>
                        </TableCell>
                        <TableCell>{request.server_name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {request.assigned_ip || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(request)}</TableCell>
                        <TableCell>
                          {request.status === 'active' && expiryInfo ? (
                            expiryInfo.isPermanent ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">∞ Permanent</Badge>
                            ) : (
                              <div
                                className={cn(
                                  'flex items-center gap-1 text-sm font-medium',
                                  expiryInfo.isExpired
                                    ? 'text-destructive'
                                    : expiryInfo.isUrgent
                                      ? 'text-warning'
                                      : 'text-success'
                                )}
                              >
                                {expiryInfo.isUrgent && <AlertTriangle className="h-3 w-3" />}
                                {expiryInfo.text}
                              </div>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {canReactivate(request) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleReactivateClick(request)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
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

      <RequestDetailsModal
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        request={selectedRequest}
        onRequestUpdated={() => {
          refetchSettings();
          refetchGameLimits();
        }}
      />

      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate "{selectedRequest?.server_name}"? This will set the server back to active with a fresh 7-day lease.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivateConfirm} disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reactivating...</>) : ('Reactivate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
