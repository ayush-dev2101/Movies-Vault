import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
  { 
    id: 1, 
    question: 'How to add movies to watchlist?', 
    answer: 'Simply open any movie details page and click the "Watchlist" button at the bottom of the screen.' 
  },
  { 
    id: 2, 
    question: 'Why is my watchlist empty?', 
    answer: 'Ensure you are logged in. If you still see it empty, try restarting the app to sync with the cloud.' 
  },
  { 
    id: 3, 
    question: 'How does login work?', 
    answer: 'We use Clerk for secure authentication. You can sign in with your email or Google account.' 
  },
  { 
    id: 4, 
    question: 'How to reset password?', 
    answer: 'On the login screen, click "Forgot Password". We will send an OTP to your email to reset it.' 
  },
];

const HelpCenterScreen = ({ navigation }: any) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
        {FAQS.map(faq => (
          <TouchableOpacity 
            key={faq.id} 
            style={styles.faqCard}
            onPress={() => toggle(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons 
                name={expanded === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={Colors.primary} 
              />
            </View>
            {expanded === faq.id && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginLeft: 15 },
  content: { padding: 20 },
  subtitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary, marginBottom: 20 },
  faqCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 15 },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 16, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 10 },
  answer: { fontSize: 14, color: Colors.textSecondary, marginTop: 15, lineHeight: 20 }
});

export default HelpCenterScreen;
