import { useAdminRequests } from '@/hooks/useAdminRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function AdminUpgrades() {
  const { requests, isLoading } = useAdminRequests();

  const boostedServers = requests.filter(
    (r) => r.ram_boost > 0 || r.cpu_boost > 0
  );

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Active Upgrades
        </CardTitle>
        <CardDescription>
          Servers with purchased resource boosts. Apply these in the game panel.
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
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boostedServers.map((server) => (
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
                    <code className="text-xs text-muted-foreground">
                      {server.stripe_subscription_id
                        ? server.stripe_subscription_id.slice(0, 20) + '…'
                        : '—'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Action Required
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(server.updated_at), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
