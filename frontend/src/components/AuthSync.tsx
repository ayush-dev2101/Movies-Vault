import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setAuthToken } from '../services/api';
import api from '../services/api';

/**
 * AuthSync Component
 * 
 * Handles:
 * 1. Syncing Clerk User ID with the Axios instance.
 * 2. Ensuring the user exists in the backend DB (User Sync).
 */
const AuthSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUserSession = async () => {
      if (isSignedIn && user) {
        try {
          // Use the raw Clerk User ID as the token for our backend lookup
          // This matches the backend's User.findOne({ clerkId: token }) logic
          setAuthToken(user.id);
          
          console.log('[MovieVault] Syncing session for user:', user.id);

          // Sync user details with backend database
          await api.post('/movies/sync-user', {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || 'Movie Lover',
            avatar: user.imageUrl,
          });

          console.log('[MovieVault] Backend sync successful');
        } catch (error: any) {
          console.error('[MovieVault] Sync Error:', error.response?.data?.message || error.message);
        }
      } else if (!isSignedIn) {
        setAuthToken(null);
      }
    };

    syncUserSession();
  }, [isSignedIn, user]);

  return null;
};

export default AuthSync;
