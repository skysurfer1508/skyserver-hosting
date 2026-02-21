import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export type GameName = 'minecraft' | 'terraria' | 'satisfactory' | 'cs2' | 'factorio' | 'rust';

interface GameLimit {
  game_name: GameName;
  max_slots: number;
  used_slots: number;
  available_slots: number;
  is_active: boolean;
  is_full: boolean;
  unlimited?: boolean;
}

interface GameCardProps {
  gameName: GameName;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  accentColor: 'green' | 'purple' | 'orange' | 'blue' | 'amber' | 'red';
  backgroundImage?: string;
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
    glow: 'hover:shadow-emerald-500/25',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
  },
  purple: {
    header: 'bg-violet-500/10 border-violet-500/30',
    icon: 'bg-violet-500/20 ring-violet-500/40',
    text: 'text-violet-400',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    button: 'bg-violet-600 hover:bg-violet-500 text-white',
    glow: 'hover:shadow-violet-500/25',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
  },
  orange: {
    header: 'bg-orange-500/10 border-orange-500/30',
    icon: 'bg-orange-500/20 ring-orange-500/40',
    text: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    button: 'bg-orange-600 hover:bg-orange-500 text-white',
    glow: 'hover:shadow-orange-500/25',
    shadowColor: 'rgba(249, 115, 22, 0.25)',
  },
  blue: {
    header: 'bg-sky-500/10 border-sky-500/30',
    icon: 'bg-sky-500/20 ring-sky-500/40',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    button: 'bg-sky-600 hover:bg-sky-500 text-white',
    glow: 'hover:shadow-sky-500/25',
    shadowColor: 'rgba(14, 165, 233, 0.25)',
  },
  amber: {
    header: 'bg-amber-500/10 border-amber-500/30',
    icon: 'bg-amber-500/20 ring-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    button: 'bg-amber-600 hover:bg-amber-500 text-white',
    glow: 'hover:shadow-amber-500/25',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
  },
  red: {
    header: 'bg-red-500/10 border-red-500/30',
    icon: 'bg-red-500/20 ring-red-500/40',
    text: 'text-red-400',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    button: 'bg-red-600 hover:bg-red-500 text-white',
    glow: 'hover:shadow-red-500/25',
    shadowColor: 'rgba(239, 68, 68, 0.25)',
  },
};

export function GameCard({
  gameName,
  title,
  icon,
  description,
  tags,
  accentColor,
  backgroundImage,
  limit,
  onSelect,
}: GameCardProps) {
  const styles = accentStyles[accentColor];
  
  const isUnlimited = limit?.unlimited ?? false;
  const percentage = !isUnlimited && limit && limit.max_slots > 0 
    ? Math.min(100, (limit.used_slots / limit.max_slots) * 100)
    : 0;

  const getProgressColor = () => {
    if (!limit?.is_active) return 'bg-muted';
    if (isUnlimited) return styles.text.replace('text-', 'bg-');
    if (limit.is_full) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return styles.text.replace('text-', 'bg-');
  };

  const getStatusText = () => {
    if (!limit) return '';
    if (!limit.is_active) return 'Unavailable';
    if (isUnlimited) return `${limit.used_slots} Active • Unlimited`;
    if (limit.is_full) return 'Sold Out';
    return `${limit.used_slots} / ${limit.max_slots} Claimed`;
  };

  const isDisabled = limit && (!limit.is_active || limit.is_full);

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        'gaming-card border-border/50 flex flex-col h-full transition-all duration-300 overflow-hidden',
        'hover:border-primary/50',
        isDisabled && 'opacity-60'
      )}
      style={{
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.boxShadow = `0 20px 40px -10px ${styles.shadowColor}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {/* Header with background image */}
        <div className="relative overflow-hidden h-36" style={{ margin: '-1px -1px 0 -1px' }}>
          {/* Background image */}
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex items-end gap-3 h-full p-5">
            <motion.div 
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl text-2xl ring-2 shrink-0',
                styles.icon
              )}
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
            >
              {icon}
            </motion.div>
            <h3 className="text-xl font-bold font-display text-white drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>

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
              {isUnlimited ? (
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={cn('h-full', getProgressColor())}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ opacity: 0.5 }}
                  />
                </div>
              ) : (
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={cn('h-full', getProgressColor())}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              )}
              <p className={cn(
                'text-xs font-medium',
                !limit.is_active
                  ? 'text-muted-foreground'
                  : isUnlimited
                  ? styles.text
                  : limit.is_full
                  ? 'text-destructive'
                  : limit.available_slots <= 2
                  ? 'text-warning'
                  : 'text-muted-foreground'
              )}>
                {getStatusText()}
                {!isUnlimited && limit.is_active && !limit.is_full && limit.available_slots <= 3 && (
                  <span className="ml-2 text-warning">• Only {limit.available_slots} left!</span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className={cn('flex-1 font-semibold', styles.button)}
              onClick={() => onSelect(gameName)}
              disabled={isDisabled}
            >
              {isDisabled 
                ? (limit?.is_full ? 'Sold Out' : 'Unavailable')
                : `Select ${title}`
              }
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 hover:border-primary/50 shrink-0"
              asChild
            >
              <Link to={`/games/${gameName}`} title="More Information">
                <Info className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
