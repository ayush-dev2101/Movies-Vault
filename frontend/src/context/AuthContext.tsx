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
    try {
      let storedToken = null;
      let storedUser = null;

      if (Platform.OS === 'web') {
        storedToken = localStorage.getItem('userToken');
        storedUser = localStorage.getItem('userData');
      } else {
        storedToken = await SecureStore.getItemAsync('userToken');
        storedUser = await SecureStore.getItemAsync('userData');
      }
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
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
