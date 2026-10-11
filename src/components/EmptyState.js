import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function EmptyState({title, message, action}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7FBF9',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDEEE4',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10261F',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#536861',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
});
