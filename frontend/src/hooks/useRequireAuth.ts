import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './useStore';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useStore();

  /**
   * Enforces login check.
   * If not logged in, immediately redirects to /login with notification.
   * If logged in, executes the provided action callback.
   */
  const requireAuth = (
    actionCallback?: () => void,
    targetPath?: string,
    customMessage?: string
  ): boolean => {
    if (!isAuthenticated) {
      showToast({
        title: 'Atelier Authentication Required',
        description:
          customMessage ||
          'Please sign in to your atelier account to explore collections, consult the stylist, and acquire pieces.',
        type: 'info',
      });
      navigate('/login', {
        state: {
          from: targetPath ? { pathname: targetPath } : location,
        },
      });
      return false;
    }

    if (actionCallback) {
      actionCallback();
    }
    return true;
  };

  return {
    isAuthenticated,
    requireAuth,
  };
};

