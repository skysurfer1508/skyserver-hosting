import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSettings {
  id: string;
  total_slots: number;
  maintenance_mode: boolean;
  global_alert_message: string | null;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeSlots, setActiveSlots] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const fetchActiveSlots = async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_slots_count');
      if (error) throw error;
      setActiveSlots(data || 0);
    } catch (error) {
      console.error('Error fetching active slots:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSettings(), fetchActiveSlots()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    if (!settings) return { error: new Error('No settings found') };

    try {
      const { error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { error: error as Error };
    }
  };

  const isFull = settings ? activeSlots >= settings.total_slots : false;

  return {
    settings,
    activeSlots,
    isLoading,
    isFull,
    updateSettings,
    refetch: () => Promise.all([fetchSettings(), fetchActiveSlots()]),
  };
}
