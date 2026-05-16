import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setAuthToken } from '../services/api';
import api from '../services/api';

/**
 * AuthSync Component
 * 
 * Handles:
 * 1. Syncing Clerk tokens with the Axios instance.
 * 2. Ensuring the user exists in the backend DB (User Sync).
 */
const AuthSync = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);
          
          // Optional: Sync user with backend if needed
          if (user) {
            await api.post('/movies/sync-user', {
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || 'Movie Lover',
              avatar: user.imageUrl,
            }).catch(e => console.warn('[MovieVault] User sync failed:', e.message));
          }
        } catch (error) {
          console.error('[MovieVault] Token sync error:', error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    };

    syncToken();
    
    // Refresh token every 50 seconds (Clerk tokens expire quickly)
    const interval = setInterval(syncToken, 50000);
    return () => clearInterval(interval);
  }, [isSignedIn, user, getToken]);

  return null;
};

export default AuthSync;
