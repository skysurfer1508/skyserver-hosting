import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Server, MessageCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { DISCORD_INVITE_URL } from '@/config/constants';

export function HeroSection() {
  const [heroRef, isHeroVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const [statsRef, isStatsVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-gaming" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10">
        <div 
          ref={heroRef}
          className={cn(
            "mx-auto max-w-4xl text-center reveal-on-scroll",
            isHeroVisible && "is-visible"
          )}
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Free Forever</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Free Game Server Hosting:{' '}
            <span className="text-primary glow-text-primary">100% Free Forever</span>
          </h1>

          {/* Subtext */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            Host Minecraft, Terraria, Rust, CS2, Factorio & Satisfactory servers for free.
            <br className="hidden sm:block" />
            A non-profit student project from Switzerland. No credit card required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2 glow-primary text-lg px-8 py-6">
                  <Server className="h-5 w-5" />
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </a>
            </div>
            
            {/* Discord Community Button */}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-[#5865F2] hover:bg-[#5865F2]/10 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Join Community on Discord
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className={cn(
            "mt-16 grid grid-cols-3 gap-8 reveal-on-scroll",
            isStatsVisible && "is-visible"
          )}
          style={{ transitionDelay: isStatsVisible ? '200ms' : '0ms' }}
        >
          <div className="text-center">
            <div className="font-display text-2xl sm:text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Server Slots</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl sm:text-3xl font-bold text-primary">6</div>
            <div className="text-sm text-muted-foreground">Games Supported</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl sm:text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
