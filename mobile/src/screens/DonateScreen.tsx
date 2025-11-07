import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DonateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Donate Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    fontSize: 18,
    color: '#6B7280',
  },
});
