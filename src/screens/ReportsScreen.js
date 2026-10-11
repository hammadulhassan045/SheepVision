import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function ReportsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Reports</Text>
      <Text style={styles.title}>Farm reports</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Farm Summary</Text>
        <Text style={styles.cardText}>No summarised report is available yet.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sheep Reports</Text>
        <Text style={styles.cardText}>Track flock performance and stock counts.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Reports</Text>
        <Text style={styles.cardText}>Monitor income, expenses, and balances.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4FBF7',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  eyebrow: {
    color: '#0F8A5F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {fontSize: 28, fontWeight: '800', color: '#0F2E24', marginBottom: 18},
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#112922', marginBottom: 6},
  cardText: {fontSize: 14, color: '#587268', lineHeight: 20},
});
