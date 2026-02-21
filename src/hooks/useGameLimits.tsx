import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type GameName = 'minecraft' | 'terraria' | 'satisfactory' | 'cs2' | 'factorio' | 'rust';

export interface GameLimit {
  game_name: GameName;
  max_slots: number;
  is_active: boolean;
  unlimited: boolean;
  used_slots: number;
  available_slots: number;
  is_full: boolean;
  base_ram_mb: number;
  base_cpu_percent: number;
}

export interface GameLimitsState {
  gameLimits: GameLimit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateGameLimit: (gameName: GameName, maxSlots: number, isActive: boolean, baseRamMb?: number, baseCpuPercent?: number, unlimited?: boolean) => Promise<{ error: Error | null }>;
}

export function useGameLimits(): GameLimitsState {
  const [gameLimits, setGameLimits] = useState<GameLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGameLimits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch game limits from the table
      const { data: limitsData, error: limitsError } = await supabase
        .from('game_limits')
        .select('*');

      if (limitsError) throw limitsError;

      if (!limitsData || limitsData.length === 0) {
        setGameLimits([]);
        return;
      }

      // For each game, get the used slot count
      const limitsWithUsage: GameLimit[] = await Promise.all(
        limitsData.map(async (limit) => {
          const { data: usedSlots, error: rpcError } = await supabase.rpc(
            'get_game_slot_usage',
            { game_name_param: limit.game_name }
          );

          if (rpcError) {
            console.error(`Error fetching slot usage for ${limit.game_name}:`, rpcError);
          }

          const used = usedSlots ?? 0;
          const isUnlimited = limit.unlimited ?? false;
          const available = isUnlimited ? Infinity : Math.max(0, limit.max_slots - used);

          return {
            game_name: limit.game_name as GameName,
            max_slots: limit.max_slots,
            is_active: limit.is_active,
            unlimited: isUnlimited,
            used_slots: used,
            available_slots: available,
            is_full: isUnlimited ? false : used >= limit.max_slots,
            base_ram_mb: limit.base_ram_mb ?? 2560,
            base_cpu_percent: limit.base_cpu_percent ?? 100,
          };
        })
      );

      setGameLimits(limitsWithUsage);
    } catch (err) {
      console.error('Error fetching game limits:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGameLimit = async (
    gameName: GameName,
    maxSlots: number,
    isActive: boolean,
    baseRamMb?: number,
    baseCpuPercent?: number,
    unlimited?: boolean
  ): Promise<{ error: Error | null }> => {
    try {
      const updateData: Record<string, unknown> = { max_slots: maxSlots, is_active: isActive };
      if (baseRamMb !== undefined) updateData.base_ram_mb = baseRamMb;
      if (baseCpuPercent !== undefined) updateData.base_cpu_percent = baseCpuPercent;
      if (unlimited !== undefined) updateData.unlimited = unlimited;

      const { error: updateError } = await supabase
        .from('game_limits')
        .update(updateData)
        .eq('game_name', gameName);

      if (updateError) throw updateError;

      // Refetch to get updated data
      await fetchGameLimits();
      return { error: null };
    } catch (err) {
      console.error('Error updating game limit:', err);
      return { error: err as Error };
    }
  };

  useEffect(() => {
    fetchGameLimits();
  }, [fetchGameLimits]);

  return {
    gameLimits,
    isLoading,
    error,
    refetch: fetchGameLimits,
    updateGameLimit,
  };
}
