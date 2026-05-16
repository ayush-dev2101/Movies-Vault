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
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'movievault' }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error("[MovieVault] Google OAuth Error:", err);
      Alert.alert('Google Sign-In Error', err.errors?.[0]?.message || 'Google login failed');
    } finally {
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
    borderColor: Colors.gray[200],
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
