import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  refreshVerification: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const checkVerificationStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error checking verification status:', error);
        return false;
      }
      return data?.is_verified ?? false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };

  const refreshVerification = useCallback(async () => {
    if (user) {
      const verified = await checkVerificationStatus(user.id);
      setIsVerified(verified);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const [adminStatus, verifiedStatus] = await Promise.all([
            checkAdminRole(initialSession.user.id),
            checkVerificationStatus(initialSession.user.id),
          ]);
          if (!isMounted) return;
          setIsAdmin(adminStatus);
          setIsVerified(verifiedStatus);
        }
      } catch (error) {
        console.error('Error during initial auth setup:', error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsVerified(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener for ongoing auth changes — does NOT control isLoading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Reset immediately — guard blocks until DB check resolves
          setIsVerified(false);
          checkAdminRole(session.user.id).then(v => isMounted && setIsAdmin(v));
          checkVerificationStatus(session.user.id).then(v => isMounted && setIsVerified(v));
        } else {
          setIsAdmin(false);
          setIsVerified(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://www.skyserver1508.org/dashboard',
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsVerified(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, isVerified, refreshVerification, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
