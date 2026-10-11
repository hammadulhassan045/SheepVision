import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

const formatCurrency = value =>
  `₨ ${Number(value || 0).toLocaleString('en-PK')}`;

export default function FinanceScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Finance</Text>
      <Text style={styles.title}>Farm finance overview</Text>

      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.value}>{formatCurrency(0)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={styles.value}>{formatCurrency(0)}</Text>
        </View>
      </View>

      <View style={styles.cardWide}>
        <Text style={styles.label}>Balance</Text>
        <Text style={styles.balance}>{formatCurrency(0)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent transactions</Text>
      <Text style={styles.empty}>No transactions recorded yet.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {paddingHorizontal: 20, paddingTop: 30, paddingBottom: 28},
  eyebrow: {
    color: '#0F8A5F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {fontSize: 28, fontWeight: '800', color: '#0F2E24', marginBottom: 18},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 10},
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    padding: 16,
  },
  cardWide: {
    backgroundColor: '#EAF8F1',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D6F4E5',
  },
  label: {fontSize: 12, color: '#587268', marginBottom: 6},
  value: {fontSize: 20, fontWeight: '800', color: '#0F2E24'},
  balance: {fontSize: 24, fontWeight: '800', color: '#0F8A5F'},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#112922',
    marginTop: 22,
    marginBottom: 12,
  },
  empty: {fontSize: 14, color: '#587268'},
});
