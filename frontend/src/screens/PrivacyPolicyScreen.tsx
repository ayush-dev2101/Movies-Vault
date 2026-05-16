import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Data Collection</Text>
        <Text style={styles.text}>
          MovieVault collects minimal data to provide a personalized experience. This includes your email address, name, and profile picture provided through Clerk authentication.
        </Text>

        <Text style={styles.sectionTitle}>2. Usage of Data</Text>
        <Text style={styles.text}>
          Your data is used solely to synchronize your watchlist and favorites across devices. We do not sell or share your data with third parties.
        </Text>

        <Text style={styles.sectionTitle}>3. Third-party APIs</Text>
        <Text style={styles.text}>
          We utilize TMDB (The Movie Database) for movie metadata and Google OAuth for simplified sign-in. These services have their own privacy policies which we recommend reviewing.
        </Text>

        <Text style={styles.sectionTitle}>4. Account Deletion</Text>
        <Text style={styles.text}>
          You have the right to delete your account at any time. Upon deletion, all your saved movies and personal profile data will be permanently erased from our servers.
        </Text>

        <Text style={styles.sectionTitle}>5. Security Notice</Text>
        <Text style={styles.text}>
          We use industry-standard encryption to protect your data. However, no method of transmission over the internet is 100% secure.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginLeft: 15 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginTop: 25, marginBottom: 10 },
  text: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 10 }
});

export default PrivacyPolicyScreen;
