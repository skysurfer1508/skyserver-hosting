import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

type GameType = 'minecraft' | 'terraria' | 'satisfactory';
type RequestStatus = 'pending' | 'active' | 'rejected';

interface ServerRequest {
  id: string;
  user_id: string;
  game_type: GameType;
  server_name: string;
  status: RequestStatus;
  ip_address: string | null;
  port: number | null;
  discord_username: string;
  description: string | null;
  server_config: Json | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // Credential fields
  assigned_ip: string | null;
  panel_url: string | null;
  panel_username: string | null;
  panel_password: string | null;
  // Rejection field
  rejection_reason: string | null;
}

export function useServerRequest() {
  const { user } = useAuth();
  const [request, setRequest] = useState<ServerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  const fetchRequest = async () => {
    if (!user) {
      setRequest(null);
      setHasActiveRequest(false);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch the most recent non-rejected request (pending or active)
      const { data: activeData, error: activeError } = await supabase
        .from('server_requests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;

      if (activeData) {
        setRequest(activeData as ServerRequest);
        setHasActiveRequest(true);
      } else {
        // If no active/pending request, check for rejected requests to display the reason
        const { data: rejectedData, error: rejectedError } = await supabase
          .from('server_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'rejected')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (rejectedError) throw rejectedError;
        
        // Show rejected request so user can see the rejection reason
        setRequest(rejectedData as ServerRequest | null);
        setHasActiveRequest(false);
      }
    } catch (error) {
      console.error('Error fetching server request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [user]);

  const createRequest = async (
    gameType: GameType,
    serverName: string,
    discordUsername: string,
    description: string | null,
    serverConfig: Record<string, unknown>
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('server_requests')
        .insert({
          user_id: user.id,
          game_type: gameType,
          server_name: serverName,
          discord_username: discordUsername,
          description: description,
          server_config: serverConfig as Json,
        })
        .select()
        .single();

      if (error) throw error;
      setRequest(data as ServerRequest);
      setHasActiveRequest(true);
      return { error: null, data };
    } catch (error) {
      console.error('Error creating server request:', error);
      return { error: error as Error };
    }
  };

  return {
    request,
    isLoading,
    hasActiveRequest,
    createRequest,
    refetch: fetchRequest,
  };
}
