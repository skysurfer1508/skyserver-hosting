import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationState {
  isEmailVerified: boolean;
  isChecking: boolean;
  userEmail: string | null;
}

export function useEmailVerification() {
  const [state, setState] = useState<EmailVerificationState>({
    isEmailVerified: true, // Assume verified until we check
    isChecking: true,
    userEmail: null,
  });
  const [isResending, setIsResending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  useEffect(() => {
    checkVerificationStatus();

    // Listen for auth state changes (e.g., when user verifies email in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        checkVerificationStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setState({
          isEmailVerified: true,
          isChecking: false,
          userEmail: null,
        });
        return;
      }

      setState({
        isEmailVerified: !!user.email_confirmed_at,
        isChecking: false,
        userEmail: user.email || null,
      });
    } catch (error) {
      console.error('Error checking verification status:', error);
      setState({
        isEmailVerified: true,
        isChecking: false,
        userEmail: null,
      });
    }
  };

  const resendVerificationEmail = async (): Promise<{ error: Error | null }> => {
    if (!state.userEmail) {
      return { error: new Error('No email address found') };
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.userEmail,
      });

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsResending(false);
    }
  };

  const updateEmail = async (newEmail: string): Promise<{ error: Error | null }> => {
    if (!newEmail || !newEmail.includes('@')) {
      return { error: new Error('Please enter a valid email address') };
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        return { error: error as Error };
      }

      // Update local state with new email
      setState((prev) => ({
        ...prev,
        userEmail: newEmail,
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return {
    ...state,
    isResending,
    isUpdatingEmail,
    resendVerificationEmail,
    updateEmail,
    refreshStatus: checkVerificationStatus,
  };
}
