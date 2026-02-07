import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type GameType = Database['public']['Enums']['game_type'];
type RequestStatus = Database['public']['Enums']['request_status'];

interface ServerRequest {
  id: string;
  user_id: string;
  game_type: GameType;
  server_name: string;
  status: RequestStatus;
  ip_address: string | null;
  port: number | null;
  created_at: string;
  updated_at: string;
}

export function useServerRequest() {
  const { user } = useAuth();
  const [request, setRequest] = useState<ServerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequest = async () => {
    if (!user) {
      setRequest(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('server_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setRequest(data);
    } catch (error) {
      console.error('Error fetching server request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [user]);

  const createRequest = async (gameType: GameType, serverName: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('server_requests')
        .insert({
          user_id: user.id,
          game_type: gameType,
          server_name: serverName,
        })
        .select()
        .single();

      if (error) throw error;
      setRequest(data);
      return { error: null, data };
    } catch (error) {
      console.error('Error creating server request:', error);
      return { error: error as Error };
    }
  };

  return {
    request,
    isLoading,
    createRequest,
    refetch: fetchRequest,
  };
}
