import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useProfileCompletion() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkProfile = async () => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile:', error);
        setIsChecking(false);
        return;
      }

      // Check if full_name is missing or empty
      const needsCompletion = !data?.full_name || data.full_name.trim() === '';
      setIsProfileIncomplete(needsCompletion);
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      checkProfile();
    } else if (!isAuthLoading && !user) {
      setIsChecking(false);
    }
  }, [user, isAuthLoading]);

  const markComplete = () => {
    setIsProfileIncomplete(false);
  };

  return {
    isProfileIncomplete,
    isChecking,
    markComplete,
    recheckProfile: checkProfile,
  };
}
