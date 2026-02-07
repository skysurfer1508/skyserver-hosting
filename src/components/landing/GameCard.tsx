import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GameName = 'minecraft' | 'terraria' | 'satisfactory';

interface GameLimit {
  game_name: GameName;
  max_slots: number;
  used_slots: number;
  available_slots: number;
  is_active: boolean;
  is_full: boolean;
}

interface GameCardProps {
  gameName: GameName;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  accentColor: 'green' | 'purple' | 'orange';
  limit?: GameLimit;
  onSelect: (gameName: GameName) => void;
}

const accentStyles = {
  green: {
    header: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'bg-emerald-500/20 ring-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    glow: 'hover:shadow-emerald-500/20 hover:border-emerald-500/50',
  },
  purple: {
    header: 'bg-violet-500/10 border-violet-500/30',
    icon: 'bg-violet-500/20 ring-violet-500/40',
    text: 'text-violet-400',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    button: 'bg-violet-600 hover:bg-violet-500 text-white',
    glow: 'hover:shadow-violet-500/20 hover:border-violet-500/50',
  },
  orange: {
    header: 'bg-orange-500/10 border-orange-500/30',
    icon: 'bg-orange-500/20 ring-orange-500/40',
    text: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    button: 'bg-orange-600 hover:bg-orange-500 text-white',
    glow: 'hover:shadow-orange-500/20 hover:border-orange-500/50',
  },
};

export function GameCard({
  gameName,
  title,
  icon,
  description,
  tags,
  accentColor,
  limit,
  onSelect,
}: GameCardProps) {
  const styles = accentStyles[accentColor];
  
  const percentage = limit && limit.max_slots > 0 
    ? Math.min(100, (limit.used_slots / limit.max_slots) * 100)
    : 0;

  const getProgressColor = () => {
    if (!limit?.is_active) return 'bg-muted';
    if (limit.is_full) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return styles.text.replace('text-', 'bg-');
  };

  const getStatusText = () => {
    if (!limit) return '';
    if (!limit.is_active) return 'Unavailable';
    if (limit.is_full) return 'Sold Out';
    return `${limit.used_slots} / ${limit.max_slots} Claimed`;
  };

  const isDisabled = limit && (!limit.is_active || limit.is_full);

  return (
    <Card className={cn(
      'gaming-card border-border/50 flex flex-col h-full transition-all duration-300 hover:shadow-xl',
      styles.glow,
      isDisabled && 'opacity-60'
    )}>
      {/* Header with icon and title */}
      <CardHeader className={cn('pb-3 rounded-t-lg border-b', styles.header)}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-2xl ring-2',
            styles.icon
          )}>
            {icon}
          </div>
          <h3 className={cn('text-xl font-bold font-display', styles.text)}>
            {title}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-5 space-y-4">
        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn('text-xs font-medium', styles.badge)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Availability Progress */}
        {limit && (
          <div className="space-y-2">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full transition-all duration-500', getProgressColor())}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={cn(
              'text-xs font-medium',
              !limit.is_active
                ? 'text-muted-foreground'
                : limit.is_full
                ? 'text-destructive'
                : limit.available_slots <= 2
                ? 'text-warning'
                : 'text-muted-foreground'
            )}>
              {getStatusText()}
              {limit.is_active && !limit.is_full && limit.available_slots <= 3 && (
                <span className="ml-2 text-warning">• Only {limit.available_slots} left!</span>
              )}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          className={cn('w-full font-semibold', styles.button)}
          onClick={() => onSelect(gameName)}
          disabled={isDisabled}
        >
          {isDisabled 
            ? (limit?.is_full ? 'Sold Out' : 'Unavailable')
            : `Select ${title}`
          }
        </Button>
      </CardContent>
    </Card>
  );
}
