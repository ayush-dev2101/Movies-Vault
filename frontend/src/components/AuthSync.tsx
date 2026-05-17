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
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUserSession = async () => {
      if (isSignedIn && user) {
        try {
          // Retrieve actual cryptographically signed Clerk session JWT
          const token = await getToken();
          if (!token) {
            console.error('[MovieVault] Failed to get valid Clerk JWT token (returned null/empty)');
            return;
          }

          console.log('[MovieVault] [AuthSync-Trace] Token retrieved successfully!');
          console.log('[MovieVault] [AuthSync-Trace] Token Length:', token.length);
          console.log('[MovieVault] [AuthSync-Trace] Token Prefix:', token.slice(0, 20) + '...');
          console.log('[MovieVault] [AuthSync-Trace] Number of segments:', token.split('.').length);

          setAuthToken(token);
          console.log('[MovieVault] Successfully set Clerk JWT token in Axios.');

          // Sync user details with backend database
          // Note: Since /sync-user is now secured behind the auth middleware,
          // the backend will extract the authenticated clerkId directly from the verified JWT.
          await api.post('/movies/sync-user', {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || 'Movie Lover',
            avatar: user.imageUrl,
          });

          console.log('[MovieVault] Secure backend user sync successful');
        } catch (error: any) {
          console.error('[MovieVault] Secure Sync Error:', error.response?.data?.message || error.message);
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
