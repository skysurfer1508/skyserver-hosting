import { Layout } from '@/components/layout/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Check, X, Crown, Clock, Headset, Zap, Server, Shield } from 'lucide-react';

const gameInfo: Record<GameName, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
  cs2: { label: 'Counter-Strike 2', icon: '🎯' },
  factorio: { label: 'Factorio', icon: '⚙️' },
  rust: { label: 'Rust', icon: '🔥' },
};

const formatRam = (mb: number) => {
  const gb = mb / 1024;
  return gb % 1 === 0 ? `${gb} GB` : `${gb.toFixed(1)} GB`;
};

const features = [
  { name: 'Server Lifetime', free: '7 Days (Renewable)', permanent: 'Forever', icon: Clock },
  { name: 'Support', free: 'Standard', permanent: 'Prioritized', icon: Headset },
  { name: 'Queue Priority', free: 'Normal', permanent: 'Priority', icon: Zap },
  { name: 'Extra RAM', free: 'Not available', permanent: 'Up to +8 GB', icon: Server },
  { name: 'Extra CPU', free: 'Not available', permanent: 'Up to +800%', icon: Zap },
  { name: 'Server Protection', free: 'Basic', permanent: 'Full Protection', icon: Shield },
];

export default function Compare() {
  usePageTitle('Free vs. Permanent — SkyServer');
  const { gameLimits, isLoading } = useGameLimits();

  const activeGames = gameLimits.filter((g) => g.is_active);

  return (
    <Layout>
      <div className="container max-w-5xl py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="text-primary border-primary/40">
            <Crown className="h-3.5 w-3.5 mr-1" /> Compare Tiers
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Free <span className="text-muted-foreground">vs.</span>{' '}
            <span className="text-primary glow-text-primary">Permanent</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See what each tier offers — free-tier specs are pulled live from our system configuration.
          </p>
        </div>

        {/* Per-Game Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Per-Game Specs</h2>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeGames.map((limit) => {
                const info = gameInfo[limit.game_name];
                return (
                  <Card key={limit.game_name} className="gaming-card border-border/50 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-2xl">{info.icon}</span>
                        {info.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {/* Free column */}
                        <div className="space-y-2">
                          <Badge variant="secondary" className="mb-1">Free</Badge>
                          <p>{formatRam(limit.base_ram_mb)} RAM</p>
                          <p>{limit.base_cpu_percent}% CPU</p>
                          <p className="text-muted-foreground">7-day lease</p>
                        </div>
                        {/* Permanent column */}
                        <div className="space-y-2">
                          <Badge className="mb-1 bg-primary/20 text-primary border-primary/30">Permanent</Badge>
                          <p className="text-primary">+ up to 8 GB RAM</p>
                          <p className="text-primary">+ up to 800% CPU</p>
                          <p className="text-primary">Never expires</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Feature Comparison Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Feature Comparison</h2>
          <Card className="gaming-card border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Feature</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Permanent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((f) => (
                    <TableRow key={f.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <f.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        {f.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{f.free}</TableCell>
                      <TableCell className="text-primary font-medium">{f.permanent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button size="lg" className="glow-primary gap-2">
              <Crown className="h-5 w-5" />
              Upgrade Now
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Request a server first, then upgrade from your dashboard.
          </p>
        </div>
      </div>
    </Layout>
  );
}
