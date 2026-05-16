import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const SignupScreen = () => <View style={styles.container}><Text>Signup Screen</Text></View>;
const OTPScreen = () => <View style={styles.container}><Text>OTP Screen</Text></View>;
const ForgotPasswordScreen = () => <View style={styles.container}><Text>Forgot Password Screen</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }
});

export { SignupScreen, OTPScreen, ForgotPasswordScreen };
