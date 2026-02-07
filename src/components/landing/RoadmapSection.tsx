import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Rocket } from 'lucide-react';

const phases = [
  {
    phase: 'Phase 1',
    status: 'current',
    title: 'Beta Launch',
    description: 'Support for Minecraft, Terraria, Satisfactory. Basic User Dashboard.',
    icon: CheckCircle2,
    items: [
      'Minecraft, Terraria & Satisfactory support',
      'User registration & authentication',
      'Server request system',
      'Admin approval workflow',
      'Basic dashboard with server status',
    ],
  },
  {
    phase: 'Phase 2',
    status: 'upcoming',
    title: 'Enhanced Control',
    description: 'Auto-Mod-Installer. FTP Access for advanced users.',
    icon: Clock,
    items: [
      'Automatic mod/plugin installer',
      'FTP access for file management',
      'World upload functionality',
      'Server console access',
      'Scheduled restarts',
    ],
  },
  {
    phase: 'Phase 3',
    status: 'future',
    title: 'Community Features',
    description: 'Community Voting for new games. Custom Subdomains.',
    icon: Rocket,
    items: [
      'Community voting for new games',
      'Custom subdomains (myserver.skyserver.io)',
      'Public server browser',
      'Discord bot integration',
      'Advanced analytics dashboard',
    ],
  },
];

const statusColors = {
  current: 'bg-success/20 text-success border-success/30',
  upcoming: 'bg-warning/20 text-warning border-warning/30',
  future: 'bg-primary/20 text-primary border-primary/30',
};

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  future: 'Future',
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Project Roadmap
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our journey to building the best free game server hosting platform
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

          <div className="space-y-8 lg:space-y-12">
            {phases.map((phase, index) => (
              <div
                key={phase.phase}
                className={`relative lg:flex ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-8`}
              >
                {/* Timeline dot */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 h-12 w-12 items-center justify-center rounded-full bg-background border-4 border-primary">
                  <phase.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Card */}
                <div className={`lg:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                  <Card className="gaming-card border-border/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <phase.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-lg font-bold text-foreground">
                              {phase.phase}
                            </span>
                            <Badge className={statusColors[phase.status as keyof typeof statusColors]}>
                              {statusLabels[phase.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold text-primary">
                            {phase.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {phase.description}
                      </p>

                      <ul className="space-y-2">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
