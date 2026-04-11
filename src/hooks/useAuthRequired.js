import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook that ensures user is authenticated before allowing execution
 * Returns true when user is authenticated and ready to make API calls
 */
export const useAuthRequired = () => {
  const { user, token } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (user && token) {
      setIsReady(true);
      setIsAuthenticating(false);
    } else {
      setIsReady(false);
      // Check localStorage as backup
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setIsReady(true);
      }
      setIsAuthenticating(false);
    }
  }, [user, token]);

  return {
    isReady,
    isAuthenticating,
    user,
    token,
  };
};
