import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Database, Container, Globe } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const technologies = [
  {
    icon: Code2,
    title: 'Frontend',
    tech: 'React & TailwindCSS',
    description: 'Fast, responsive, and modern UI built with React 18 and TailwindCSS for a seamless user experience.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Database,
    title: 'Backend',
    tech: 'Supabase',
    description: 'Secure database, authentication, and real-time capabilities powered by Supabase\'s PostgreSQL platform.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Container,
    title: 'Infrastructure',
    tech: 'Docker Containers',
    description: 'Each game server runs in an isolated Docker container, ensuring security and stability.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Globe,
    title: 'Hosting',
    tech: 'Swiss Data Center',
    description: 'Servers hosted in Switzerland for excellent European connectivity, high privacy standards, and low latency.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
];

export function TechStackSection() {
  const [headerRef, isHeaderVisible] = useScrollReveal<HTMLDivElement>();
  const [cardsRef, isCardsVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });
  const [badgeRef, isBadgeVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section id="tech-stack" className="py-20 bg-background">
      <div className="container">
        <div 
          ref={headerRef}
          className={cn(
            "text-center mb-12 opacity-0",
            isHeaderVisible && "animate-reveal-up"
          )}
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Our Tech Stack
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with modern, reliable technologies by computer science students who care about quality
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech, index) => (
            <div
              key={tech.title}
              className={cn(
                "opacity-0",
                isCardsVisible && "animate-reveal-up"
              )}
              style={{ animationDelay: isCardsVisible ? `${index * 100}ms` : '0ms' }}
            >
              <Card
                className="gaming-card border-border/50 transition-all hover:border-primary/50 hover:glow-primary group h-full"
              >
                <CardHeader>
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${tech.bgColor} group-hover:scale-110 transition-transform`}>
                    <tech.icon className={`h-7 w-7 ${tech.color}`} />
                  </div>
                  <CardTitle className="text-lg">
                    <span className="text-muted-foreground">{tech.title}</span>
                    <br />
                    <span className={tech.color}>{tech.tech}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Student Project Badge */}
        <div 
          ref={badgeRef}
          className={cn(
            "mt-12 text-center opacity-0",
            isBadgeVisible && "animate-reveal-up"
          )}
          style={{ animationDelay: isBadgeVisible ? '200ms' : '0ms' }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-6 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">🎓</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Student Project</p>
              <p className="text-xs text-muted-foreground">
                Built with ❤️ in Switzerland
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
