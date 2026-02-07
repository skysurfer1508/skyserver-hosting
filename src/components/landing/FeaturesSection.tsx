import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Globe, Shield, Zap, Server, Clock, Loader2, FolderOpen, Puzzle, Users } from 'lucide-react';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { GameCard } from './GameCard';
import { ServerRequestModal } from './ServerRequestModal';

const gameData: {
  gameName: GameName;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  accentColor: 'green' | 'purple' | 'orange';
}[] = [
  {
    gameName: 'minecraft',
    title: 'Minecraft',
    icon: '⛏️',
    description: 'Build, explore, and survive in infinite worlds. Full support for Spigot, Paper, and Forge.',
    tags: ['Java & Bedrock', 'Mods & Plugins', '24/7 Online'],
    accentColor: 'green',
  },
  {
    gameName: 'terraria',
    title: 'Terraria',
    icon: '🌳',
    description: 'Dig, fight, explore, and build. The world is at your fingertips as you fight for survival, fortune, and glory.',
    tags: ['tModLoader Supported', 'Large Worlds', 'Journey Mode'],
    accentColor: 'purple',
  },
  {
    gameName: 'satisfactory',
    title: 'Satisfactory',
    icon: '🏭',
    description: 'Construct massive factories and automate production on an alien planet. Perfect for co-op sessions.',
    tags: ['Experimental Branch', 'Unlimited Saves', 'High Performance'],
    accentColor: 'orange',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Free Hosting',
    description: 'No credit card required. No subscription fees. Completely free forever.',
  },
  {
    icon: FolderOpen,
    title: 'Full SFTP Access',
    description: 'Access your server files directly via SFTP or the web file browser. Upload worlds, configs, and mods.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: "Don't manage alone. Invite friends as Sub-Users and assign them granular permissions to help run your server.",
  },
  {
    icon: Puzzle,
    title: 'Modding Supported',
    description: 'Install any mods, plugins, or modpacks you want. Full support for Forge, Fabric, Spigot, and more.',
  },
  {
    icon: Globe,
    title: 'Low Latency',
    description: 'Servers located in Switzerland for excellent European connectivity.',
  },
  {
    icon: Clock,
    title: 'Scheduled Tasks',
    description: 'Set up auto-restarts, automated commands, and scheduled backups with ease.',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade protection to keep your server online.',
  },
  {
    icon: Server,
    title: 'MySQL Databases',
    description: 'Free MySQL databases included for plugins that need persistent data storage.',
  },
  {
    icon: Gamepad2,
    title: 'Web Console',
    description: 'Full control panel with live console, CPU/RAM monitoring, and one-click management.',
  },
];

export function FeaturesSection() {
  const { gameLimits, isLoading } = useGameLimits();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameName | undefined>();

  const handleSelectGame = (gameName: GameName) => {
    setSelectedGame(gameName);
    setModalOpen(true);
  };

  const getGameLimit = (gameName: GameName) => {
    return gameLimits.find((l) => l.game_name === gameName);
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
              {gameData.map((game) => (
                <GameCard
                  key={game.gameName}
                  gameName={game.gameName}
                  title={game.title}
                  icon={game.icon}
                  description={game.description}
                  tags={game.tags}
                  accentColor={game.accentColor}
                  limit={getGameLimit(game.gameName)}
                  onSelect={handleSelectGame}
                />
              ))}
            </div>
          )}

          {/* Server Request Modal */}
          <ServerRequestModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            preSelectedGame={selectedGame}
          />
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
