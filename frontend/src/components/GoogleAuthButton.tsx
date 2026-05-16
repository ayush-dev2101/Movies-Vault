import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import API_URL from '../config/api';

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
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
      if (Platform.OS === 'web') {
        Alert.alert('Notice', 'Google Sign-In is currently only available on the mobile app. Please use the standard Login/Signup for the web demo.');
        setLoading(false);
        return;
      }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut(); // prevents stale cached session

      const googleRes = await GoogleSignin.signIn();
      const idToken = googleRes.data?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Google sign-in failed — no token received');
        setLoading(false);
        return;
      }

      const apiRes = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await apiRes.json();

      if (!apiRes.ok) {
        Alert.alert('Error', data.message || 'Google login failed');
        setLoading(false);
        return;
      }

      await login({ name: data.user?.name || data.name, email: data.user?.email || data.email, avatar: data.user?.avatar || data.avatar, id: data.user?.id || data._id }, data.token);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setLoading(false);
        return;
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        setLoading(false);
        return;
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available on this device');
        setLoading(false);
        return;
      }
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
