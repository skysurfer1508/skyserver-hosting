import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database, Json } from '@/integrations/supabase/types';

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
  discord_username: string;
  description: string | null;
  server_config: Json | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  // New credential fields
  assigned_ip: string | null;
  panel_url: string | null;
  panel_username: string | null;
  panel_password: string | null;
}

interface ApprovalData {
  assignedIp: string;
  panelUrl: string;
  panelUsername: string;
  panelPassword: string;
}

export function useAdminRequests() {
  const [requests, setRequests] = useState<ServerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // Fetch server requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('server_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of user_id -> email
        const emailMap = new Map<string, string>();
        profilesData?.forEach(p => emailMap.set(p.id, p.email));

        // Merge requests with emails
        const requestsWithEmails = requestsData?.map(r => ({
          ...r,
          user_email: emailMap.get(r.user_id) || 'Unknown',
        })) || [];

        setRequests(requestsWithEmails);
      } else {
        setRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (requestId: string, approvalData: ApprovalData) => {
    try {
      const { error } = await supabase
        .from('server_requests')
        .update({
          status: 'active' as RequestStatus,
          assigned_ip: approvalData.assignedIp,
          panel_url: approvalData.panelUrl,
          panel_username: approvalData.panelUsername,
          panel_password: approvalData.panelPassword,
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const rejectRequest = async (requestId: string, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('server_requests')
        .update({
          status: 'rejected' as RequestStatus,
          rejection_reason: rejectionReason || null,
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('server_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    requests,
    isLoading,
    approveRequest,
    rejectRequest,
    deleteRequest,
    refetch: fetchRequests,
  };
}
