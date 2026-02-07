import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gamepad2, Globe, Shield, Zap, Server, Clock, Loader2, FolderOpen, Puzzle } from 'lucide-react';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { cn } from '@/lib/utils';

const gameInfo: Record<GameName, { name: string; icon: string }> = {
  minecraft: { name: 'Minecraft', icon: '⛏️' },
  terraria: { name: 'Terraria', icon: '🌳' },
  satisfactory: { name: 'Satisfactory', icon: '🏭' },
};

const benefits = [
  {
    icon: Zap,
    title: 'Free Hosting',
    description: 'No credit card required. No subscription fees. Completely free forever.',
  },
  {
    icon: FolderOpen,
    title: 'Full FTP Access',
    description: 'Access your server files directly. Upload your own worlds, configs, and mods without restrictions.',
  },
  {
    icon: Puzzle,
    title: 'Modding Supported',
    description: 'Want to play Modded Minecraft or TModLoader? You have full write access to install whatever you want.',
  },
  {
    icon: Globe,
    title: 'Low Latency',
    description: 'Servers located in Switzerland for excellent European connectivity.',
  },
  {
    icon: Clock,
    title: 'High Uptime',
    description: '99.9% uptime guarantee with automatic backups and monitoring.',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade protection to keep your server online.',
  },
  {
    icon: Server,
    title: 'Instant Setup',
    description: 'Your server is ready within minutes after approval.',
  },
  {
    icon: Gamepad2,
    title: 'Easy Control',
    description: 'Simple dashboard to manage your server with one click.',
  },
];

export function FeaturesSection() {
  const { gameLimits, isLoading } = useGameLimits();

  const getProgressColor = (usedSlots: number, maxSlots: number, isActive: boolean) => {
    if (!isActive) return 'bg-muted';
    const percentage = (usedSlots / maxSlots) * 100;
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusText = (limit: { used_slots: number; max_slots: number; is_active: boolean; is_full: boolean }) => {
    if (!limit.is_active) return 'Unavailable';
    if (limit.is_full) return 'Sold Out';
    return `${limit.used_slots} / ${limit.max_slots} Claimed`;
  };

  return (
    <section id="features" className="py-20 bg-card/30">
      <div className="container">
        {/* Games Section */}
        <div className="mb-20">
          <h2 className="mb-4 text-center font-display text-3xl font-bold text-foreground">
            Supported Games
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Host your favorite multiplayer games with ease
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {gameLimits.map((limit) => {
                const game = gameInfo[limit.game_name];
                const percentage = limit.max_slots > 0 
                  ? Math.min(100, (limit.used_slots / limit.max_slots) * 100)
                  : 0;
                const progressColor = getProgressColor(limit.used_slots, limit.max_slots, limit.is_active);

                return (
                  <Card
                    key={limit.game_name}
                    className={cn(
                      'gaming-card border-border/50 transition-all',
                      limit.is_full || !limit.is_active
                        ? 'opacity-75'
                        : 'hover:border-primary/50 hover:glow-primary'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{game.icon}</span>
                        <CardTitle className="text-xl">{game.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn('h-full transition-all duration-500', progressColor)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className={cn(
                          'text-sm font-medium',
                          !limit.is_active
                            ? 'text-muted-foreground'
                            : limit.is_full
                            ? 'text-destructive'
                            : limit.available_slots <= 2
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        )}>
                          {getStatusText(limit)}
                        </p>
                      </div>

                      {/* Availability badge */}
                      <div className={cn(
                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                        !limit.is_active
                          ? 'bg-muted text-muted-foreground'
                          : limit.is_full
                          ? 'bg-destructive/20 text-destructive'
                          : limit.available_slots <= 2
                          ? 'bg-warning/20 text-warning'
                          : 'bg-primary/20 text-primary'
                      )}>
                        {!limit.is_active ? (
                          'Currently Disabled'
                        ) : limit.is_full ? (
                          'No Slots Available'
                        ) : limit.available_slots <= 2 ? (
                          `Only ${limit.available_slots} left!`
                        ) : (
                          `${limit.available_slots} slots available`
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div>
          <h2 className="mb-4 text-center font-display text-3xl font-bold text-foreground">
            Why Choose Us?
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Built by gamers, for gamers
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="gaming-card border-border/50 transition-all hover:border-primary/50 hover:glow-primary">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
