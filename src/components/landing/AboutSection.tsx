import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, MapPin } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export function AboutSection() {
  const [headerRef, isHeaderVisible] = useScrollReveal<HTMLDivElement>();
  const [cardRef, isCardVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div 
            ref={headerRef}
            className={cn(
              "reveal-on-scroll",
              isHeaderVisible && "is-visible"
            )}
          >
            <h2 className="mb-4 text-center font-display text-3xl font-bold text-foreground">
              About SkyServer
            </h2>
            <p className="mb-10 text-center text-muted-foreground">
              A fair student project from the heart of Switzerland
            </p>
          </div>

          <div
            ref={cardRef}
            className={cn(
              "reveal-on-scroll",
              isCardVisible && "is-visible"
            )}
            style={{ transitionDelay: isCardVisible ? '150ms' : '0ms' }}
          >
            <Card className="gaming-card border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                      Non-Profit
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Run by students, for the community. No profit motive, just passion for gaming.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                      <Shield className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                      Privacy First
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Swiss data protection standards. Your data stays secure and private.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <MapPin className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                      Swiss Quality
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      High-performance servers located in Switzerland for optimal European latency.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-lg bg-muted/50 p-6 text-center">
                  <p className="text-lg text-foreground">
                    "SkyServer is a fair student project. We offer high-performance hosting with no compromises. 
                    Thanks to our Swiss location, you benefit from extremely low latency and high data privacy standards."
                  </p>
                  <p className="mt-4 font-display text-primary">
                    Built by gamers, for gamers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
