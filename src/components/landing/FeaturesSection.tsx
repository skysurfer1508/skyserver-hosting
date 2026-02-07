import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Globe, Shield, Zap, Server, Clock } from 'lucide-react';

const games = [
  { name: 'Minecraft', icon: '⛏️', color: 'bg-green-500/20 text-green-400' },
  { name: 'Terraria', icon: '🌳', color: 'bg-amber-500/20 text-amber-400' },
  { name: 'Satisfactory', icon: '🏭', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'Valheim', icon: '⚔️', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'ARK', icon: '🦖', color: 'bg-purple-500/20 text-purple-400' },
];

const benefits = [
  {
    icon: Zap,
    title: 'Free Hosting',
    description: 'No credit card required. No subscription fees. Completely free forever.',
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
          
          <div className="flex flex-wrap justify-center gap-4">
            {games.map((game) => (
              <div
                key={game.name}
                className={`flex items-center gap-3 rounded-xl px-6 py-4 ${game.color} border border-border/50 transition-transform hover:scale-105`}
              >
                <span className="text-2xl">{game.icon}</span>
                <span className="font-medium">{game.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div>
          <h2 className="mb-4 text-center font-display text-3xl font-bold text-foreground">
            Why Choose Us?
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Built by gamers, for gamers
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
