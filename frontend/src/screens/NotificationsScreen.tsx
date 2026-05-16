import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
  { id: '1', title: 'New movie added', message: 'Avengers Endgame is now available in 4K.', time: '2 mins ago', icon: 'film' },
  { id: '2', title: 'Watchlist Update', message: 'Your watchlist update was successful.', time: '1 hour ago', icon: 'bookmark' },
  { id: '3', title: 'Welcome Back', message: 'Welcome back to Movie Vault! Check out today\'s trends.', time: '5 hours ago', icon: 'heart' },
  { id: '4', title: 'Account Security', message: 'Your password was successfully updated.', time: '1 day ago', icon: 'shield-checkmark' },
];

const NotificationsScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={24} color={Colors.white} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginLeft: 15 },
  list: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, padding: 15, borderRadius: 16, marginBottom: 15 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  message: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  time: { fontSize: 12, color: Colors.gray[400] }
});

export default NotificationsScreen;
