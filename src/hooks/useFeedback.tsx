import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type FeedbackType = 'bug' | 'feature' | 'general';

export interface Feedback {
  id: string;
  user_id: string;
  feedback_type: FeedbackType;
  message: string;
  rating: number;
  created_at: string;
  user_email?: string;
}

export interface CreateFeedbackData {
  feedback_type: FeedbackType;
  message: string;
  rating: number;
}

export function useFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFeedback = useMutation({
    mutationFn: async (data: CreateFeedbackData) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback_type: data.feedback_type,
          message: data.message,
          rating: data.rating,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Thank you for your feedback!',
        description: 'We appreciate you taking the time to help us improve.',
      });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit feedback',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { createFeedback };
}

export function useAdminFeedback(limit: number = 5) {
  return useQuery({
    queryKey: ['feedback', 'admin', limit],
    queryFn: async () => {
      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (feedbackError) throw feedbackError;

      // Fetch user emails from profiles
      const userIds = [...new Set(feedbackData?.map(f => f.user_id) || [])];
      
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      return (feedbackData || []).map(feedback => ({
        ...feedback,
        user_email: emailMap.get(feedback.user_id) || undefined,
      })) as Feedback[];
    },
  });
}
