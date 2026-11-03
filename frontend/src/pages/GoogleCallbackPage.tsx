import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const { showToast } = useStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleGoogleCallback() {
      const code = searchParams.get('code');
      const credential = searchParams.get('credential');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        if (isMounted) setError(`Google authorization was declined: ${errorParam}`);
        return;
      }

      if (!code && !credential) {
        if (isMounted) setError('No authorization code or credentials received from Google.');
        return;
      }

      try {
        const res = await loginWithGoogle({ credential: credential || code || '' });
        if (isMounted) {
          if (res.success) {
            showToast({
              title: `Welcome, ${res.user?.firstName || 'Valued Client'}`,
              description: 'Successfully authenticated with Google.',
              type: 'info',
            });
            navigate('/account/home', { replace: true });
          } else {
            setError(res.error || 'Failed to authenticate Google credentials.');
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'An unexpected error occurred during Google authentication.');
      }
    }

    handleGoogleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, loginWithGoogle, navigate, showToast]);

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E4DED4] p-8 text-center shadow-xs">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#242522]">Authentication Notice</h2>
            <p className="text-xs text-[#5A5C55] font-light leading-relaxed">{error}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium hover:bg-[#383934] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#777B63] flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="font-serif text-2xl text-[#242522]">Authenticating with Google</h2>
            <p className="text-xs text-[#5A5C55] font-light leading-relaxed">
              Verifying your identity with the atelier security concierge. You will be redirected momentarily.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

