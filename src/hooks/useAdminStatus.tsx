import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformSettings {
  id: string;
  is_admin_online: boolean;
}

export function useAdminStatus() {
  const [isAdminOnline, setIsAdminOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsAdminOnline(data.is_admin_online);
        setSettingsId(data.id);
      }
    } catch (error) {
      console.error('Error fetching admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const updateStatus = async (isOnline: boolean) => {
    if (!settingsId) return { error: new Error('No settings found') };

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ is_admin_online: isOnline })
        .eq('id', settingsId);

      if (error) throw error;

      setIsAdminOnline(isOnline);
      return { error: null };
    } catch (error) {
      console.error('Error updating admin status:', error);
      return { error: error as Error };
    }
  };

  return {
    isAdminOnline,
    isLoading,
    updateStatus,
    refetch: fetchStatus,
  };
}
