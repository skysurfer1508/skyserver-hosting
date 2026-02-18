import { useEffect, useState, useCallback } from 'react';
import { Server, Users, Cpu, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { LucideIcon } from 'lucide-react';

interface PanelStats {
  total_servers: number;
  total_users: number;
  total_ram_mb: number;
  nodes_online: number;
}

function useCountUp(target: number, duration: number, start: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target === 0) {
      if (start) setValue(target);
      return;
    }
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
}

function formatRam(mb: number): string {
  if (mb >= 1024 * 1024) return `${(mb / (1024 * 1024)).toFixed(1)} TB`;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

interface StatItemProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  isVisible: boolean;
  delay: number;
}

function StatItem({ icon: Icon, value, label, isVisible, delay }: StatItemProps) {
  return (
    <Card
      className="gaming-card border-border/50 transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveStatsSection() {
  const [stats, setStats] = useState<PanelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sectionRef, isVisible] = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const animatedServers = useCountUp(stats?.total_servers ?? 0, 2000, isVisible && !!stats);
  const animatedUsers = useCountUp(stats?.total_users ?? 0, 2000, isVisible && !!stats);
  const animatedRam = useCountUp(stats?.total_ram_mb ?? 0, 2000, isVisible && !!stats);
  const animatedNodes = useCountUp(stats?.nodes_online ?? 0, 2000, isVisible && !!stats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('panel-stats');
        if (fnError) throw fnError;
        setStats(data as PanelStats);
      } catch (e) {
        console.error('Failed to fetch panel stats:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-2 glow-text-primary text-foreground"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          Live Platform Statistics
        </h2>
        <p
          className="text-muted-foreground text-center mb-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.1s',
          }}
        >
          Real-time data from our infrastructure
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="gaming-card border-border/50">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              icon={Server}
              value={error ? '--' : animatedServers}
              label="Servers Deployed"
              isVisible={isVisible}
              delay={0}
            />
            <StatItem
              icon={Users}
              value={error ? '--' : animatedUsers}
              label="Happy Gamers"
              isVisible={isVisible}
              delay={100}
            />
            <StatItem
              icon={Cpu}
              value={error ? '--' : formatRam(animatedRam)}
              label="RAM Powered"
              isVisible={isVisible}
              delay={200}
            />
            <StatItem
              icon={Globe}
              value={error ? '--' : animatedNodes}
              label="Nodes Online"
              isVisible={isVisible}
              delay={300}
            />
          </div>
        )}
      </div>
    </section>
  );
}
