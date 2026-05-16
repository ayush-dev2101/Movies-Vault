import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  isAuthModalVisible: boolean;
  showAuthModal: (onSuccessAction?: () => void) => void;
  hideAuthModal: () => void;
  login: (userData: any, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    console.log("[MovieVault] Initializing Auth State...");
    try {
      let storedToken = null;
      let storedUserString = null;

      // Use a race or simple try/catch to prevent storage hangs
      if (Platform.OS === 'web') {
        storedToken = localStorage.getItem('userToken');
        storedUserString = localStorage.getItem('userData');
      } else {
        // SecureStore can sometimes fail if the device is under heavy load
        try {
          storedToken = await SecureStore.getItemAsync('userToken');
          storedUserString = await SecureStore.getItemAsync('userData');
        } catch (storageError) {
          console.warn("[MovieVault] SecureStore access failed:", storageError);
        }
      }
      
      if (storedToken && storedUserString) {
        try {
          const parsedUser = JSON.parse(storedUserString);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("[MovieVault] Auth state restored successfully");
        } catch (parseError) {
          console.error("[MovieVault] Corrupted user data found, clearing storage:", parseError);
          // If data is corrupted, we must clear it to prevent infinite crashes
          await logout(); 
        }
      }
    } catch (e) {
      console.error('[MovieVault] Critical Auth Initialization Error:', e);
    } finally {
      // ABSOLUTE GUARANTEE: The app will stop loading here
      setIsLoading(false);
      console.log("[MovieVault] Auth Initialization Complete.");
    }
  };

  const showAuthModal = (onSuccessAction?: () => void) => {
    if (onSuccessAction) {
      setPendingAction(() => onSuccessAction);
    }
    setIsAuthModalVisible(true);
  };

  const hideAuthModal = () => {
    setIsAuthModalVisible(false);
    setPendingAction(null);
  };

  const login = async (userData: any, token: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      setToken(token);
      setUser(userData);
      
      // Execute pending action if any
      hideAuthModal(); // Hide modal first
      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
        }, 300); // small delay for modal animation
      }
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
      }
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthModalVisible,
      showAuthModal,
      hideAuthModal,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
