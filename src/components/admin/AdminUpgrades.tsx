import { useState } from 'react';
import { useAdminRequests } from '@/hooks/useAdminRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Zap, Check, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminUpgrades() {
  const { requests, isLoading, refetch } = useAdminRequests();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'approve' | 'delete'; serverName: string } | null>(null);

  const boostedServers = requests.filter(
    (r) => r.ram_boost > 0 || r.cpu_boost > 0 || (r as any).boost_status === 'pending'
  );

  const handleApprove = async (id: string) => {
    setConfirmAction(null);
    setActionLoading(id);
    const { error } = await supabase
      .from('server_requests')
      .update({ boost_status: 'approved' } as any)
      .eq('id', id);
    setActionLoading(null);
    if (error) {
      toast({ title: 'Error', description: 'Failed to approve upgrade.', variant: 'destructive' });
    } else {
      toast({ title: 'Approved', description: 'Upgrade has been approved.' });
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmAction(null);
    setActionLoading(id);
    const { error } = await supabase
      .from('server_requests')
      .update({ ram_boost: 0, cpu_boost: 0, stripe_subscription_id: null, boost_status: 'none' } as any)
      .eq('id', id);
    setActionLoading(null);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete upgrade.', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Upgrade has been removed. The user can now purchase a new one.' });
      refetch();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Active Upgrades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Active Upgrades
          </CardTitle>
          <CardDescription>
            Servers with purchased resource boosts. Approve pending upgrades or delete them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {boostedServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No active upgrades</p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Upgrades will appear here when users purchase resource boosts.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>RAM Boost</TableHead>
                  <TableHead>CPU Boost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boostedServers.map((server) => {
                  const boostStatus = (server as any).boost_status || 'none';
                  const isActionLoading = actionLoading === server.id;

                  return (
                    <TableRow key={server.id}>
                      <TableCell className="text-sm">{server.user_email || 'Unknown'}</TableCell>
                      <TableCell className="font-medium">{server.server_name}</TableCell>
                      <TableCell className="capitalize">{server.game_type}</TableCell>
                      <TableCell>
                        {server.ram_boost > 0 ? (
                          <Badge variant="secondary">+{(server.ram_boost / 1024).toFixed(0)} GB</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {server.cpu_boost > 0 ? (
                          <Badge variant="secondary">+{server.cpu_boost}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {boostStatus === 'pending' ? (
                          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                            Pending
                          </Badge>
                        ) : boostStatus === 'approved' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Approved
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(server.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {boostStatus === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={isActionLoading}
                              onClick={() => setConfirmAction({ id: server.id, type: 'approve', serverName: server.server_name })}
                            >
                              {isActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            disabled={isActionLoading}
                            onClick={() => setConfirmAction({ id: server.id, type: 'delete', serverName: server.server_name })}
                          >
                            {isActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'approve' ? 'Approve Upgrade?' : 'Delete Upgrade?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'approve'
                ? `Mark the resource upgrade for "${confirmAction.serverName}" as approved? The user will see it as active.`
                : `Remove the upgrade for "${confirmAction?.serverName}"? This resets boosts to zero and allows the user to purchase again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === 'approve') handleApprove(confirmAction.id);
                else handleDelete(confirmAction.id);
              }}
            >
              {confirmAction?.type === 'approve' ? 'Approve' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
