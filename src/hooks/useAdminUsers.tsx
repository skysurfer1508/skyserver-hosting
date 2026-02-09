import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  is_banned: boolean;
  is_admin: boolean;
  is_verified: boolean;
  discord_username: string | null;
  created_at: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVerificationStatus = async (userIds: string[]): Promise<Record<string, boolean>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return {};

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-users-verification-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_ids: userIds }),
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch verification status');
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return {};
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, is_banned, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Fetch discord usernames from most recent server requests
      const { data: serverRequests, error: requestsError } = await supabase
        .from('server_requests')
        .select('user_id, discord_username')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Create a map of user_id -> discord_username (most recent)
      const discordMap = new Map<string, string>();
      serverRequests?.forEach(r => {
        if (!discordMap.has(r.user_id) && r.discord_username) {
          discordMap.set(r.user_id, r.discord_username);
        }
      });

      // Fetch verification status from Edge Function
      const userIds = profiles?.map(p => p.id) || [];
      const verificationStatus = await fetchVerificationStatus(userIds);

      // Merge data
      const usersWithRoles: AdminUser[] = profiles?.map(p => ({
        id: p.id,
        email: p.email,
        username: p.username,
        full_name: p.full_name,
        is_banned: p.is_banned || false,
        is_admin: adminUserIds.has(p.id),
        is_verified: verificationStatus[p.id] ?? false,
        discord_username: discordMap.get(p.id) || null,
        created_at: p.created_at,
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanned })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      if (currentIsAdmin) {
        // Demote: delete admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        // Promote: insert admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }
      await fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    users,
    isLoading,
    toggleBan,
    toggleAdmin,
    refetch: fetchUsers,
  };
}
