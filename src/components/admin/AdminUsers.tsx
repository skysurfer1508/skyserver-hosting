import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Loader2, Shield, Ban } from 'lucide-react';

export function AdminUsers() {
  const { users, isLoading, toggleBan, toggleAdmin } = useAdminUsers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.discord_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBan = async (userId: string, currentBanned: boolean, email: string) => {
    setIsSubmitting(userId + '-ban');
    const { error } = await toggleBan(userId, currentBanned);
    setIsSubmitting(null);

    if (error) {
      toast({
        title: 'Failed to update user',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: currentBanned ? 'User unbanned' : 'User banned',
      description: `${email} has been ${currentBanned ? 'unbanned' : 'banned'}.`,
    });
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean, email: string) => {
    setIsSubmitting(userId + '-admin');
    const { error } = await toggleAdmin(userId, currentIsAdmin);
    setIsSubmitting(null);

    if (error) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: currentIsAdmin ? 'Admin role removed' : 'Admin role granted',
      description: `${email} is now ${currentIsAdmin ? 'a regular user' : 'an admin'}.`,
    });
  };

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or Discord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Discord</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-center">Ban</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.is_banned ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.is_banned && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Banned
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.discord_username || '-'}
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={user.is_banned}
                        onCheckedChange={() => handleToggleBan(user.id, user.is_banned, user.email)}
                        disabled={isSubmitting === user.id + '-ban'}
                        className="data-[state=checked]:bg-destructive"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={user.is_admin}
                        onCheckedChange={() => handleToggleAdmin(user.id, user.is_admin, user.email)}
                        disabled={isSubmitting === user.id + '-admin'}
                        className="data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
