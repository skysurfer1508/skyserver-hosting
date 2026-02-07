import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Server } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-gaming" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Free Forever</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your own Game Server:{' '}
            <span className="text-primary glow-text-primary">100% Free</span>
          </h1>

          {/* Subtext */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            SkyServer is an independent non-profit student project from Switzerland.
            <br className="hidden sm:block" />
            No credit card. No hidden fees. Pure performance.
          </p>

          {/* CTA Buttons */}
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

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Server Slots</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Games Supported</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
