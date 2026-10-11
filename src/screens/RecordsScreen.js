import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function RecordsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Records</Text>
      <Text style={styles.message}>More management features coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2E24',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#536861',
    textAlign: 'center',
  },
});
