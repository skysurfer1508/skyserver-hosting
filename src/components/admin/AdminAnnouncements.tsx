import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  useAnnouncements, 
  useCreateAnnouncement, 
  useDeleteAnnouncement,
  AnnouncementCategory 
} from '@/hooks/useAnnouncements';
import { Megaphone, Loader2, Trash2, Rocket, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const categoryConfig: Record<AnnouncementCategory, {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
}> = {
  update: {
    label: '🚀 Update',
    icon: Rocket,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  maintenance: {
    label: '⚠️ Maintenance',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  info: {
    label: 'ℹ️ Info',
    icon: Info,
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
};

export function AdminAnnouncements() {
  const { toast } = useToast();
  const { data: announcements, isLoading } = useAnnouncements(5);
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({ title, content, category });
      toast({
        title: '✅ Announcement Posted',
        description: 'Your announcement is now live.',
      });
      setTitle('');
      setContent('');
      setCategory('info');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post announcement.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: '🗑️ Deleted',
        description: 'Announcement removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Post Form */}
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Post Announcement
          </CardTitle>
          <CardDescription>
            Broadcast news, updates, or maintenance notices to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., New Feature Released!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">🚀 Update</SelectItem>
                  <SelectItem value="maintenance">⚠️ Maintenance</SelectItem>
                  <SelectItem value="info">ℹ️ Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your announcement details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Post News
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Last 5 announcements. Delete any mistakes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !announcements || announcements.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No announcements yet.
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const config = categoryConfig[announcement.category];
                return (
                  <div
                    key={announcement.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", config.badgeClass)}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(announcement.created_at), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {announcement.content}
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{announcement.title}" from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(announcement.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
