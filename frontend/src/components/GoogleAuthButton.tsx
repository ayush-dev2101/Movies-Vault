import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthButtonProps {
  title?: string;
  onSuccess?: () => void;
  style?: object;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  title = "Continue with Google",
  onSuccess,
  style
}) => {
  const [loading, setLoading] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handlePress = useCallback(async () => {
    // 1. Start loading
    setLoading(true);

    // 2. Set a safety timeout (15 seconds)
    const timeoutId = setTimeout(() => {
      setLoading(false);
      Alert.alert('Sign-In Timeout', 'Google sign-in is taking too long. Please try again or check your internet.');
    }, 15000);

    try {
      console.log('[MovieVault] Starting Google OAuth flow...');
      
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'movievault' }),
      });

      if (createdSessionId) {
        console.log('[MovieVault] Google Auth Successful, session created');
        await setActive!({ session: createdSessionId });
        if (onSuccess) onSuccess();
      } else {
        console.warn('[MovieVault] Google Auth cancelled or no session created');
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[MovieVault] Google OAuth Error:", err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Google login failed';
      
      // Don't show alert if it was a user cancellation
      if (!errorMessage.includes('cancel')) {
        Alert.alert('Google Sign-In Error', errorMessage);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [startOAuthFlow, onSuccess]);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          <Ionicons name="logo-google" size={20} color={Colors.text} style={styles.icon} />
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default GoogleAuthButton;
