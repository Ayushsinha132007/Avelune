import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  guestOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  guestOnly = false,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F1] flex flex-col items-center justify-center p-6 text-[#242522]">
        <span className="font-serif text-3xl tracking-[0.2em] font-normal mb-4">
          AVELUNE
        </span>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63]">
          <Loader2 className="w-4 h-4 animate-spin text-[#D8C6AA]" />
          <span>Verifying Atelier Session...</span>
        </div>
      </div>
    );
  }

  // If page is for guests only (e.g. /login, /signup) and user is already authenticated
  if (guestOnly && isAuthenticated) {
    return <Navigate to="/account/home" replace />;
  }

  // If page requires authentication and user is NOT authenticated
  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

