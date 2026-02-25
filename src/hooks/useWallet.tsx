import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [profileRes, txRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single(),
        supabase
          .from('wallet_transactions' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (profileRes.data) {
        setBalance(Number((profileRes.data as any).wallet_balance) || 0);
      }
      if (txRes.data) {
        setTransactions(txRes.data as any as WalletTransaction[]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const topUp = async (amount: number): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('create-wallet-topup', {
      body: { amount },
    });

    if (error) throw new Error(error.message || 'Failed to create checkout session');
    if (!data?.url) throw new Error('No checkout URL returned');

    return data.url;
  };

  const deduct = async (amount: number, description: string) => {
    if (!user) throw new Error('Not authenticated');
    if (balance < amount) throw new Error('Insufficient balance');

    const newBalance = balance - amount;

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance } as any)
      .eq('id', user.id);

    if (updateErr) throw updateErr;

    const { error: txErr } = await supabase
      .from('wallet_transactions' as any)
      .insert({
        user_id: user.id,
        amount,
        type: 'debit',
        description,
      } as any);

    if (txErr) throw txErr;

    await fetchWallet();
  };

  return { balance, transactions, isLoading, topUp, deduct, refetch: fetchWallet };
}
