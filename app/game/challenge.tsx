import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// Non-AR placeholder to keep route alive after removing AR dependencies
export default function ChallengePlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenge Mode</Text>
      <Text style={styles.subtitle}>
        Mode AR sudah dimatikan untuk sementara. Kamu tetap bisa lanjut main di mode lain.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/game')}>
        <Text style={styles.primaryText}>Kembali ke menu game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#22D3EE',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryText: {
    color: '#0B1726',
    fontSize: 16,
    fontWeight: '700',
  },
});
