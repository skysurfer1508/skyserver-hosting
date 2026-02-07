import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DecryptedCredentials {
  assigned_ip: string | null;
  panel_url: string | null;
  panel_username: string | null;
  panel_password: string | null;
}

export function useDecryptedCredentials() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedCredentials, setDecryptedCredentials] = useState<DecryptedCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decryptCredentials = useCallback(async (requestId: string): Promise<DecryptedCredentials | null> => {
    setIsDecrypting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('decrypt-credentials', {
        body: { requestId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to decrypt credentials');
      }

      const credentials = response.data as DecryptedCredentials;
      setDecryptedCredentials(credentials);
      return credentials;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decrypt credentials';
      setError(errorMessage);
      console.error('Error decrypting credentials:', err);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const clearCredentials = useCallback(() => {
    setDecryptedCredentials(null);
    setError(null);
  }, []);

  return {
    decryptCredentials,
    decryptedCredentials,
    isDecrypting,
    error,
    clearCredentials,
  };
}
