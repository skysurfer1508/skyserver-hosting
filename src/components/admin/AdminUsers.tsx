import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Loader2, Shield, Ban, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function AdminUsers() {
  const { users, isLoading, toggleBan, toggleAdmin, refetch } = useAdminUsers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string; email: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.discord_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDeleteUser = async () => {
    if (!deleteDialog) return;

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ user_id: deleteDialog.userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      toast({
        title: 'User deleted',
        description: `${deleteDialog.email} has been permanently deleted.`,
      });

      await refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog(null);
      setConfirmText('');
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
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or Discord..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Discord</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-center">Ban</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.is_banned ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        {user.full_name || user.username || '-'}
                      </TableCell>
                      <TableCell>
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
                      <TableCell className="text-center">
                        {user.is_verified ? (
                          <CheckCircle className="h-4 w-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={user.is_banned}
                          onCheckedChange={() => handleToggleBan(user.id, user.is_banned, user.email)}
                          disabled={isSubmitting === user.id + '-ban' || user.is_admin}
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
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteDialog({ open: true, userId: user.id, email: user.email })}
                          disabled={user.is_admin}
                          title={user.is_admin ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently delete the account
                for <span className="font-semibold">{deleteDialog?.email}</span> and remove all their data.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirm-delete-admin">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm:
                </Label>
                <Input
                  id="confirm-delete-admin"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialog(null); setConfirmText(''); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={confirmText !== 'DELETE' || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
