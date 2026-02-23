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
import { Loader2, Cpu, MemoryStick, AlertTriangle, Zap, ArrowLeft, Check, Headset, Shield, Clock, Package } from 'lucide-react';
import { STRIPE_PRICES, STRIPE_COUPON_BULK } from '@/config/constants';

const PRICE_PER_UNIT = 1.50;
const DISCOUNT_THRESHOLD = 6;

function calculatePrice(quantity: number) {
  const original = quantity * PRICE_PER_UNIT;
  const discounted = quantity > DISCOUNT_THRESHOLD ? original * 0.90 : original;
  return { original, discounted, hasDiscount: quantity > DISCOUNT_THRESHOLD };
}

type SelectedPackage = 'custom' | 'heavy-duty-ram' | 'heavy-duty-cpu' | null;

export default function ServerUpgrade() {
  const { request, isLoading } = useServerRequest();
  const { gameLimits, isLoading: gameLimitsLoading } = useGameLimits();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ramQuantity, setRamQuantity] = useState(1);
  const [cpuQuantity, setCpuQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage>('custom');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const gameLimit = request ? gameLimits.find(g => g.game_name === request.game_type) : null;
  const BASE_RAM_GB = gameLimit ? gameLimit.base_ram_mb / 1024 : 2.5;
  const BASE_CPU_PERCENT = gameLimit?.base_cpu_percent ?? 100;

  const ramPrice = calculatePrice(ramQuantity);
  const cpuPrice = calculatePrice(cpuQuantity);
  const customTotal = ramPrice.discounted + cpuPrice.discounted;
  const customOriginalTotal = ramPrice.original + cpuPrice.original;
  const hasAnyDiscount = ramPrice.hasDiscount || cpuPrice.hasDiscount;

  const currentRamBoostGB = (request?.ram_boost || 0) / 1024;
  const currentCpuBoost = request?.cpu_boost || 0;

  const handleCheckout = async () => {
    if (!request) return;

    setIsCheckingOut(true);
    try {
      let body: any = { serverId: request.id };

      if (selectedPackage === 'heavy-duty-ram') {
        body.heavyDutyPackage = 'ram';
      } else if (selectedPackage === 'heavy-duty-cpu') {
        body.heavyDutyPackage = 'cpu';
      } else if (selectedPackage === 'custom') {
        body.ramQuantity = ramQuantity;
        body.cpuQuantity = cpuQuantity;
        body.applyBulkDiscount = hasAnyDiscount;
      } else {
        toast({ title: 'No upgrade selected', description: 'Please select an upgrade option.', variant: 'destructive' });
        setIsCheckingOut(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', { body });
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
      <div className="container max-w-4xl mx-auto py-12 px-4 space-y-6">
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

        {/* Upgrade Options */}
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
          <>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Choose Your Upgrade
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Option A: Custom Slider */}
              <Card
                className={`gaming-card cursor-pointer transition-all ${selectedPackage === 'custom' ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                onClick={() => setSelectedPackage('custom')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Custom Upgrade</CardTitle>
                    {selectedPackage === 'custom' && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <CardDescription>Pick exactly the resources you need</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* RAM Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-primary" />
                        <span className="font-medium">Extra RAM</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{ramQuantity} GB</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          {ramPrice.hasDiscount ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{ramPrice.original.toFixed(2)} CHF</span>
                              <span className="text-xs font-semibold text-success">{ramPrice.discounted.toFixed(2)} CHF</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-success/20 text-success border-success/30">10% Off!</Badge>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">{ramPrice.original.toFixed(2)} CHF/month</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[ramQuantity]}
                      onValueChange={([v]) => { setRamQuantity(v); setSelectedPackage('custom'); }}
                      min={1}
                      max={12}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 GB</span>
                      <span>12 GB</span>
                    </div>
                  </div>

                  {/* CPU Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" />
                        <span className="font-medium">Extra CPU</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{cpuQuantity * 100}%</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          {cpuPrice.hasDiscount ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{cpuPrice.original.toFixed(2)} CHF</span>
                              <span className="text-xs font-semibold text-success">{cpuPrice.discounted.toFixed(2)} CHF</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-success/20 text-success border-success/30">10% Off!</Badge>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">{cpuPrice.original.toFixed(2)} CHF/month</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[cpuQuantity]}
                      onValueChange={([v]) => { setCpuQuantity(v); setSelectedPackage('custom'); }}
                      min={1}
                      max={8}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100%</span>
                      <span>800%</span>
                    </div>
                  </div>

                  {/* Custom Total */}
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Total</span>
                      <div className="flex items-center gap-2">
                        {hasAnyDiscount && (
                          <span className="text-sm text-muted-foreground line-through">{customOriginalTotal.toFixed(2)} CHF</span>
                        )}
                        <span className="text-lg font-bold">{customTotal.toFixed(2)} CHF</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Option B: Heavy-Duty Bundles */}
              <div className="space-y-4">
                {/* Heavy-Duty RAM */}
                <Card
                  className={`gaming-card cursor-pointer transition-all ${selectedPackage === 'heavy-duty-ram' ? 'border-primary ring-2 ring-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border/50'}`}
                  onClick={() => setSelectedPackage('heavy-duty-ram')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">10GB Heavy-Duty RAM</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">Best value for large Satisfactory factories or busy Minecraft networks.</p>
                          <p className="text-xl font-bold mt-2">13.00 CHF <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                        </div>
                      </div>
                      {selectedPackage === 'heavy-duty-ram' ? (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Heavy-Duty CPU */}
                <Card
                  className={`gaming-card cursor-pointer transition-all ${selectedPackage === 'heavy-duty-cpu' ? 'border-primary ring-2 ring-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border/50'}`}
                  onClick={() => setSelectedPackage('heavy-duty-cpu')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Cpu className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">800% Heavy-Duty CPU</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">Maximum processing power for modded servers and heavy workloads.</p>
                          <p className="text-xl font-bold mt-2">10.00 CHF <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                        </div>
                      </div>
                      {selectedPackage === 'heavy-duty-cpu' ? (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
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

            {/* Checkout */}
            <div className="rounded-lg bg-muted/30 border border-border/50 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-2xl font-bold">
                  {selectedPackage === 'heavy-duty-ram'
                    ? '13.00'
                    : selectedPackage === 'heavy-duty-cpu'
                    ? '10.00'
                    : customTotal.toFixed(2)}{' '}
                  CHF
                </p>
              </div>
              <Button
                size="lg"
                className="glow-primary gap-2"
                disabled={!selectedPackage || isCheckingOut}
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
          </>
        )}
      </div>
    </Layout>
  );
}
