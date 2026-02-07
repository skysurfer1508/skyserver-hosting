import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeServers: number;
  pendingRequests: number;
  totalSlotsUsed: number;
  totalSlotsMax: number;
  usagePercentage: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeServers: 0,
    pendingRequests: 0,
    totalSlotsUsed: 0,
    totalSlotsMax: 0,
    usagePercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch active servers count
      const { count: activeCount, error: activeError } = await supabase
        .from('server_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Fetch pending requests count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('server_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch game limits for slot usage
      const { data: gameLimits, error: limitsError } = await supabase
        .from('game_limits')
        .select('game_name, max_slots, is_active');

      if (limitsError) throw limitsError;

      // Calculate total max slots from active games
      const totalSlotsMax = gameLimits
        ?.filter(g => g.is_active)
        .reduce((sum, g) => sum + g.max_slots, 0) || 0;

      // Get used slots (active + pending)
      const { count: usedCount, error: usedError } = await supabase
        .from('server_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'pending']);

      if (usedError) throw usedError;

      const totalSlotsUsed = usedCount || 0;
      const usagePercentage = totalSlotsMax > 0 
        ? Math.round((totalSlotsUsed / totalSlotsMax) * 100) 
        : 0;

      setStats({
        totalUsers: usersCount || 0,
        activeServers: activeCount || 0,
        pendingRequests: pendingCount || 0,
        totalSlotsUsed,
        totalSlotsMax,
        usagePercentage,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}
