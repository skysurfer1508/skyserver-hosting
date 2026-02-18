import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useServerRequest } from '@/hooks/useServerRequest';
import { useGameLimits } from '@/hooks/useGameLimits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cpu, MemoryStick, AlertTriangle, Zap, ArrowLeft, Check, Headset, Shield, Clock } from 'lucide-react';

const PRICE_PER_UNIT = 1.50;

export default function ServerUpgrade() {
  const { request, isLoading } = useServerRequest();
  const { gameLimits, isLoading: gameLimitsLoading } = useGameLimits();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ramQuantity, setRamQuantity] = useState(0);
  const [cpuQuantity, setCpuQuantity] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Get base specs from game limits for the current server's game type
  const gameLimit = request ? gameLimits.find(g => g.game_name === request.game_type) : null;
  const BASE_RAM_GB = gameLimit ? gameLimit.base_ram_mb / 1024 : 2.5;
  const BASE_CPU_PERCENT = gameLimit?.base_cpu_percent ?? 100;

  const totalPrice = (ramQuantity + cpuQuantity) * PRICE_PER_UNIT;

  const currentRamBoostGB = (request?.ram_boost || 0) / 1024;
  const currentCpuBoost = request?.cpu_boost || 0;

  const handleCheckout = async () => {
    if (!request) return;
    if (ramQuantity === 0 && cpuQuantity === 0) {
      toast({ title: 'No upgrades selected', description: 'Please select at least one upgrade.', variant: 'destructive' });
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { ramQuantity, cpuQuantity, serverId: request.id },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({ title: 'Checkout failed', description: error.message || 'Failed to create checkout session.', variant: 'destructive' });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading || gameLimitsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!request || request.status !== 'active') {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <Card className="gaming-card border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You need an active server to access upgrades.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-12 px-4 space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Current Specs */}
        <Card className="gaming-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Current Server Specs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MemoryStick className="h-4 w-4" />
                  RAM
                </div>
                <p className="text-lg font-bold">
                  {BASE_RAM_GB} GB
                  {currentRamBoostGB > 0 && (
                    <span className="text-success"> + {currentRamBoostGB} GB</span>
                  )}
                </p>
                {currentRamBoostGB > 0 && (
                  <p className="text-xs text-muted-foreground">= {BASE_RAM_GB + currentRamBoostGB} GB total</p>
                )}
              </div>
              <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Cpu className="h-4 w-4" />
                  CPU
                </div>
                <p className="text-lg font-bold">
                  {BASE_CPU_PERCENT}%
                  {currentCpuBoost > 0 && (
                    <span className="text-success"> + {currentCpuBoost}%</span>
                  )}
                </p>
                {currentCpuBoost > 0 && (
                  <p className="text-xs text-muted-foreground">= {BASE_CPU_PERCENT + currentCpuBoost}% total</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        {!request.stripe_subscription_id && (
          <Card className="gaming-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Upgrade Benefits
              </CardTitle>
              <CardDescription>
                What you get when you purchase extra resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Headset, title: 'Prioritized Support', desc: 'Faster response times from the support team' },
                  { icon: Shield, title: 'Permanent Server', desc: 'Your server will never expire — no more 7-day renewals' },
                  { icon: Clock, title: 'Priority Queue', desc: 'Your upgrade requests are processed first' },
                  { icon: Zap, title: 'Performance Boost', desc: 'Direct hardware resource improvements for your server' },
                ].map((b) => (
                  <div key={b.title} className="flex gap-3 rounded-lg bg-muted/30 border border-border/50 p-4">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{b.title}</p>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Sliders */}
        {request.stripe_subscription_id ? (
          <Card className="gaming-card border-border/50">
            <CardContent className="py-8 text-center space-y-4">
              <Badge className="bg-success/20 text-success border-success/30">Active Subscription</Badge>
              <p className="text-muted-foreground">
                You already have an active resource subscription. Use the "Manage Subscription" button in your dashboard settings to modify or cancel it.
              </p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="gaming-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Add Extra Resources
              </CardTitle>
              <CardDescription>
                Select the amount of extra resources you'd like to add to your server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* RAM Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-primary" />
                    <span className="font-medium">Extra RAM</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{ramQuantity} GB</span>
                    {ramQuantity > 0 && (
                      <p className="text-xs text-muted-foreground">{(ramQuantity * PRICE_PER_UNIT).toFixed(2)} CHF/month</p>
                    )}
                  </div>
                </div>
                <Slider
                  value={[ramQuantity]}
                  onValueChange={([v]) => setRamQuantity(v)}
                  min={0}
                  max={8}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 GB</span>
                  <span>8 GB</span>
                </div>
              </div>

              {/* CPU Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="font-medium">Extra CPU</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{cpuQuantity * 100}%</span>
                    {cpuQuantity > 0 && (
                      <p className="text-xs text-muted-foreground">{(cpuQuantity * PRICE_PER_UNIT).toFixed(2)} CHF/month</p>
                    )}
                  </div>
                </div>
                <Slider
                  value={[cpuQuantity]}
                  onValueChange={([v]) => setCpuQuantity(v)}
                  min={0}
                  max={8}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>800%</span>
                </div>
              </div>

              {/* Disclaimer */}
              <Alert className="border-warning/30 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">Please Note</AlertTitle>
                <AlertDescription className="text-warning/80">
                  Upgrades are usually instant, but in some cases, it may take up to 24 hours for the new resources to be applied to your server.
                </AlertDescription>
              </Alert>

              {/* Total & Checkout */}
              <div className="rounded-lg bg-muted/30 border border-border/50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Total</p>
                  <p className="text-2xl font-bold">{totalPrice.toFixed(2)} CHF</p>
                </div>
                <Button
                  size="lg"
                  className="glow-primary gap-2"
                  disabled={totalPrice === 0 || isCheckingOut}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Go to Checkout
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
