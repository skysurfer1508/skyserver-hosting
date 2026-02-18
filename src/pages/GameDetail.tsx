import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getGameBySlug } from '@/data/gameDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Server, Cpu, HardDrive, Shield, Users, Zap, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const accentMap = {
  green: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', button: 'bg-emerald-600 hover:bg-emerald-500', glow: 'rgba(16,185,129,0.3)' },
  purple: { text: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30', button: 'bg-violet-600 hover:bg-violet-500', glow: 'rgba(139,92,246,0.3)' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', button: 'bg-orange-600 hover:bg-orange-500', glow: 'rgba(249,115,22,0.3)' },
  blue: { text: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30', button: 'bg-sky-600 hover:bg-sky-500', glow: 'rgba(14,165,233,0.3)' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', button: 'bg-amber-600 hover:bg-amber-500', glow: 'rgba(245,158,11,0.3)' },
  red: { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', button: 'bg-red-600 hover:bg-red-500', glow: 'rgba(239,68,68,0.3)' },
};

const specIcons: Record<string, React.ReactNode> = {
  RAM: <Server className="h-4 w-4" />,
  CPU: <Cpu className="h-4 w-4" />,
  Storage: <HardDrive className="h-4 w-4" />,
  'DDoS Protection': <Shield className="h-4 w-4" />,
  Players: <Users className="h-4 w-4" />,
};

const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const game = getGameBySlug(slug || '');
  const [specsLoading, setSpecsLoading] = useState(true);
  const [liveSpecs, setLiveSpecs] = useState<{ label: string; value: string }[] | null>(null);

  usePageTitle(game ? `Free ${game.name} Server Hosting | SkyServer` : 'Game Not Found | SkyServer');

  useEffect(() => {
    if (!slug) return;
    const fetchSpecs = async () => {
      setSpecsLoading(true);
      const { data, error } = await supabase
        .from('game_limits')
        .select('base_ram_mb, base_cpu_percent')
        .eq('game_name', slug)
        .maybeSingle();

      if (!error && data) {
        const ramMb = data.base_ram_mb;
        const ramValue = ramMb >= 1024
          ? `${(ramMb / 1024).toFixed(ramMb % 1024 === 0 ? 0 : 1)} GB`
          : `${ramMb} MB`;
        setLiveSpecs([
          { label: 'RAM', value: ramValue },
          { label: 'CPU', value: `${data.base_cpu_percent}%` },
          { label: 'Storage', value: 'Unlimited' },
          { label: 'DDoS Protection', value: 'Included' },
          { label: 'Players', value: 'Unlimited' },
        ]);
      }
      setSpecsLoading(false);
    };
    fetchSpecs();
  }, [slug]);

  useEffect(() => {
    if (game) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', game.seoDescription);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = game.seoDescription;
        document.head.appendChild(newMeta);
      }
      return () => {
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute('content', 'SkyServer - Free Game Server Hosting');
      };
    }
  }, [game]);

  if (!game) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold font-display">Game Not Found</h1>
          <p className="text-muted-foreground">The game you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const colors = accentMap[game.accentColor];

  return (
    <Layout>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `Free ${game.name} Server Hosting`,
            description: game.seoDescription,
            brand: { '@type': 'Organization', name: 'SkyServer' },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={game.backgroundImage} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Games
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{game.icon}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight">
                Free <span className={colors.text}>{game.name}</span> Server Hosting
              </h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-8">
              {game.seoDescription}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className={`${colors.button} text-white font-semibold text-lg px-8 py-6`}
                onClick={() => navigate('/register')}
              >
                <Zap className="mr-2 h-5 w-5" /> Create Server Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted/50 text-lg px-8 py-6"
                asChild
              >
                <a href="https://panel.skyserver1508.org" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" /> Open Panel
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specs Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {specsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 justify-center">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))
            ) : (
              (liveSpecs || game.specs).map((spec) => (
                <motion.div
                  key={spec.label}
                  className="flex items-center gap-3 justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <span className={colors.text}>{specIcons[spec.label] || <Server className="h-4 w-4" />}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="font-semibold text-sm">{spec.value}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Why Host <span className={colors.text}>{game.name}</span> on SkyServer?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {game.tagline}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {game.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="gaming-card border-border/50 h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${colors.text}`} />
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SkyServer Section */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className={`${colors.bg} ${colors.text} ${colors.border} mb-4`}>
                Performance Optimized
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Built for {game.name}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {game.whySkyServer}
              </p>
              <Button
                size="lg"
                className={`${colors.button} text-white font-semibold px-8`}
                onClick={() => navigate('/register')}
              >
                Get Started — It's Free
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GameDetail;
