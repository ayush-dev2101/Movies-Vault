import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import CustomButton from './CustomButton';
import GoogleAuthButton from './GoogleAuthButton';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AuthModal = () => {
  const { isAuthModalVisible, hideAuthModal, login } = useAuth();
  const navigation = useNavigation<any>();

  const handleMockLogin = () => {
    // For demo purposes, automatically log in the user when they click a button
    // In reality, this would trigger the actual login flow or navigate to login screen
    // while keeping the pending action intact
    login({ name: 'Guest User', email: 'guest@example.com' }, 'mock-token');
  };

  const navigateToLogin = () => {
    hideAuthModal();
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const navigateToSignup = () => {
    hideAuthModal();
    navigation.navigate('Auth', { screen: 'Signup' });
  };

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent
      animationType="slide"
      onRequestClose={hideAuthModal}
    >
      <Pressable onPress={hideAuthModal}>
        <View style={styles.overlay}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} style={styles.blurContainer} tint="light">
                <View style={styles.dragIndicator} />
                
                <TouchableOpacity style={styles.closeButton} onPress={hideAuthModal}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                  <Ionicons name="film" size={40} color={Colors.primary} style={styles.icon} />
                  <Text style={styles.title}>Unlock Full Access</Text>
                  <Text style={styles.subtitle}>
                    Log in to view details, save your favorites, and build your watchlist.
                  </Text>
                </View>

                <View style={styles.actionContainer}>
                  <CustomButton 
                    title="Log In" 
                    onPress={navigateToLogin} 
                    style={styles.button}
                  />
                  <CustomButton 
                    title="Sign Up" 
                    variant="outline" 
                    onPress={navigateToSignup} 
                    style={styles.button}
                  />
                  
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                  </View>

                  <GoogleAuthButton 
                    title="Continue with Google" 
                    style={styles.googleButton} 
                    onSuccess={hideAuthModal}
                  />
                  
                  {/* Mock login for easy testing of the conditional flow */}
                  <TouchableOpacity onPress={handleMockLogin} style={styles.mockLogin}>
                    <Text style={styles.mockLoginText}>Continue as Demo User</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.45,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.9)' : 'transparent',
  },
  blurContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: Colors.gray[300],
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  actionContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    paddingHorizontal: 15,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    marginBottom: 15,
  },
  mockLogin: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  mockLoginText: {
    color: Colors.gray[500],
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});

export default AuthModal;
