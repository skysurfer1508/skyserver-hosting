import { useAnnouncements, AnnouncementCategory } from '@/hooks/useAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone, Rocket, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NewsFeedProps {
  limit?: number;
  showHeader?: boolean;
  maxHeight?: string;
  className?: string;
}

const categoryConfig: Record<AnnouncementCategory, {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  borderClass: string;
}> = {
  update: {
    label: '🚀 Update',
    icon: Rocket,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-l-emerald-500',
  },
  maintenance: {
    label: '⚠️ Maintenance',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderClass: 'border-l-amber-500',
  },
  info: {
    label: 'ℹ️ Info',
    icon: Info,
    badgeClass: 'bg-muted text-muted-foreground border-border',
    borderClass: 'border-l-muted-foreground',
  },
};

export function NewsFeed({ 
  limit = 10, 
  showHeader = true, 
  maxHeight = '300px',
  className 
}: NewsFeedProps) {
  const { data: announcements, isLoading, error } = useAnnouncements(limit);

  if (error) {
    return (
      <Card className={cn("gaming-card", className)}>
        <CardContent className="p-6">
          <p className="text-destructive text-sm">Failed to load announcements.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("gaming-card border-border/50", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-primary" />
            System News
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : "p-4"}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No announcements yet.
          </p>
        ) : (
          <ScrollArea style={{ maxHeight }} className="pr-4">
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const config = categoryConfig[announcement.category];
                return (
                  <div
                    key={announcement.id}
                    className={cn(
                      "p-3 rounded-lg bg-card/50 border border-border/50 border-l-4 transition-colors hover:bg-card/80",
                      config.borderClass
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", config.badgeClass)}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(announcement.created_at), 'dd.MM.yyyy')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
