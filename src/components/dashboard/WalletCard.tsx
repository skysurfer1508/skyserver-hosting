import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { TopUpModal } from '@/components/dashboard/TopUpModal';
import { format } from 'date-fns';

export function WalletCard() {
  const { balance, transactions, isLoading, topUp } = useWallet();
  const [topUpOpen, setTopUpOpen] = useState(false);

  if (isLoading) {
    return (
      <Card className="gaming-card border-border/50">
        <CardContent className="pt-6 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="gaming-card border-border/50">
        <CardContent className="pt-6 space-y-4">
          {/* Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Wallet</p>
                <p className="text-xl font-bold">{balance.toFixed(2)} CHF</p>
              </div>
            </div>
            <Button size="sm" className="gap-1" onClick={() => setTopUpOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Top-Up
            </Button>
          </div>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Recent Transactions</p>
              <ScrollArea className="max-h-[180px]">
                <div className="space-y-1.5">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {tx.type === 'credit' ? (
                          <ArrowDownRight className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span className="text-muted-foreground truncate max-w-[120px]">{tx.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={tx.type === 'credit' ? 'text-success font-medium' : 'text-destructive font-medium'}>
                          {tx.type === 'credit' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'dd.MM')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} onTopUp={topUp} />
    </>
  );
}
