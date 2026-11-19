import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_DESIGNATED_EMAIL } from '../../services/adminService';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#242522] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-sm tracking-widest uppercase text-[#5A5C55]">
          Verifying Atelier Director Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isAuthorized =
    user?.email?.trim().toLowerCase() === ADMIN_DESIGNATED_EMAIL.toLowerCase() ||
    Boolean((user as any)?.isAdmin);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E4DED4] p-8 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 text-red-700 rounded-full flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl text-[#242522] mb-2 tracking-wide uppercase">
            Access Restricted
          </h2>
          <p className="text-xs text-[#5A5C55] mb-6 leading-relaxed">
            The Atelier Executive Admin Suite is exclusively restricted to the designated Atelier
            Director (<span className="font-mono font-semibold text-[#242522]">{ADMIN_DESIGNATED_EMAIL}</span>).
            Your active session (<span className="font-mono text-[#242522]">{user?.email}</span>) does not hold
            director privileges.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/account/home"
              className="w-full py-2.5 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest hover:bg-[#3A3B37] transition-colors"
            >
              Return to Client Account
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-xs text-[#777B63] hover:text-[#242522] transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

