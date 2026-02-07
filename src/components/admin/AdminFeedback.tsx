import { Bug, Lightbulb, MessageCircle, Star, Inbox } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminFeedback, FeedbackType } from '@/hooks/useFeedback';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const feedbackTypeConfig: Record<FeedbackType, { label: string; icon: React.ElementType; badgeClass: string }> = {
  bug: { 
    label: 'Bug', 
    icon: Bug, 
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30' 
  },
  feature: { 
    label: 'Feature', 
    icon: Lightbulb, 
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' 
  },
  general: { 
    label: 'General', 
    icon: MessageCircle, 
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3.5 w-3.5',
            rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

export function AdminFeedback() {
  const { data: feedback, isLoading, error } = useAdminFeedback(5);

  if (isLoading) {
    return (
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            Recent User Feedback
          </CardTitle>
          <CardDescription>Latest feedback from users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg bg-muted/30">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            Recent User Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load feedback</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          Recent User Feedback
        </CardTitle>
        <CardDescription>Latest feedback from users</CardDescription>
      </CardHeader>
      <CardContent>
        {!feedback || feedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Inbox className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No feedback received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((item) => {
              const typeConfig = feedbackTypeConfig[item.feedback_type];
              const TypeIcon = typeConfig.icon;
              
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {item.user_email || item.user_id.slice(0, 8) + '...'}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-xs">
                        {format(new Date(item.created_at), 'dd.MM.yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={item.rating} />
                      <Badge variant="outline" className={cn('text-xs', typeConfig.badgeClass)}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Message */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
