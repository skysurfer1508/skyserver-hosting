import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Wallet, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopUp: (amount: number) => Promise<string>;
}

const QUICK_AMOUNTS = [5, 10, 20];

export function TopUpModal({ open, onOpenChange, onTopUp }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = selectedAmount ?? (parseFloat(customAmount) || 0);

  const handleQuickSelect = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setSelectedAmount(null);
  };

  const handleSubmit = async () => {
    if (amount <= 0) return;
    setIsProcessing(true);
    try {
      const url = await onTopUp(amount);
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e.message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Top-Up Balance
          </DialogTitle>
          <DialogDescription>Add funds to your wallet via Stripe</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick select */}
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <Button
                key={val}
                variant={selectedAmount === val ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleQuickSelect(val)}
              >
                {val.toFixed(2)} CHF
              </Button>
            ))}
          </div>

          {/* Custom input */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Custom amount</label>
            <div className="relative">
              <Input
                type="number"
                min="0.50"
                step="0.50"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">CHF</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full gap-2"
            disabled={amount <= 0 || isProcessing}
            onClick={handleSubmit}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                {`Pay ${amount.toFixed(2)} CHF with Stripe`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
