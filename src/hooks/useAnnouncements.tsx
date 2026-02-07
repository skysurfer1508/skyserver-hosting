import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AnnouncementCategory = 'update' | 'maintenance' | 'info';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  created_at: string;
}

export function useAnnouncements(limit?: number) {
  return useQuery({
    queryKey: ['announcements', limit],
    queryFn: async () => {
      let query = supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: { 
      title: string; 
      content: string; 
      category: AnnouncementCategory 
    }) => {
      const { data, error } = await supabase
        .from('system_announcements')
        .insert(announcement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
