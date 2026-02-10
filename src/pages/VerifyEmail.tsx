import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { refreshVerification } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const type = params.get('type');

      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid verification link.');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'signup' | 'magiclink',
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
      } else {
        // Mark profile as verified in the database
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', currentUser.id);
        }
        setStatus('success');
        await refreshVerification();
        window.history.replaceState({}, '', '/auth/verify');
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    };

    verify();
  }, [navigate]);

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-gaming opacity-50" />
        <Card className="relative w-full max-w-md gaming-card border-border/50">
          <CardHeader className="text-center">
            {status === 'verifying' && (
              <>
                <div className="mx-auto mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle className="font-display text-2xl">Verifying Email...</CardTitle>
                <CardDescription>Please wait while we verify your email address.</CardDescription>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
                <CardTitle className="font-display text-2xl">Email Verified!</CardTitle>
                <CardDescription>Your email has been verified. Redirecting to dashboard...</CardDescription>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="font-display text-2xl">Verification Failed</CardTitle>
                <CardDescription>{errorMessage || 'The link is invalid or has expired.'}</CardDescription>
              </>
            )}
          </CardHeader>
          {status === 'error' && (
            <CardContent className="text-center">
              <Button onClick={() => navigate('/login')} className="glow-primary">
                Back to Sign In
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}
