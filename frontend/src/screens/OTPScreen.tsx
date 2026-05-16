import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import Colors from '../constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

const OTPScreen = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email || '';
  const type: string = route.params?.type || 'verification';
  const inputRef = useRef<TextInput>(null);

  // Stable handler — no inline functions to prevent re-render loops
  const handleVerifyOTP = useCallback(async () => {
    if (!isLoaded) return;

    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code.');
      return;
    }

    if (type === 'password_reset') {
      navigation.navigate('ResetPassword', { email, otp });
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code: otp });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        Alert.alert('Error', 'Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || 'OTP verification failed.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, otp, type, email, signUp, setActive, navigation]);

  const handleResendOTP = useCallback(async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Sent', 'A new code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err?.errors?.[0]?.message || 'Could not resend code');
    }
  }, [isLoaded, signUp]);

  return (
    // StatusBar explicit set prevents layout jumps
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // On Android, 'height' behavior causes vertical thrashing — use undefined + ScrollView instead
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-unread-outline" size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the code sent to{'\n'}{email}</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.inputContainer}
            >
              <Ionicons name="keypad-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor={Colors.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOTP}
                autoFocus={false}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn} onPress={handleResendOTP}>
              <Text style={styles.resendText}>
                Didn't receive a code?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: 6,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60, // Fixed height prevents layout flicker during loading state
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resendBtn: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 6,
  },
  backText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OTPScreen;
