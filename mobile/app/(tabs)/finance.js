import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const transactions = [
  { id: '1', title: 'Organic Groceries', amount: '-₹1,450', category: 'Groceries', date: 'Oct 30' },
  { id: '2', title: 'Consulting Retainer', amount: '+₹65,000', category: 'Income', date: 'Oct 28' },
  { id: '3', title: 'Gym & Crossfit', amount: '-₹2,500', category: 'Fitness', date: 'Oct 25' },
  { id: '4', title: 'Healthy Dining (Salad Bar)', amount: '-₹680', category: 'Food Out', date: 'Oct 24' },
];

export default function MobileFinance() {
  return (
    <View style={styles.container}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Monthly Balance</Text>
        <Text style={styles.summaryAmount}>₹42,750.00</Text>
        <Text style={styles.summarySub}>Income: ₹75,400 • Expenses: ₹32,650</Text>
      </View>

      <Text style={styles.listHeader}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txSub}>{item.category} • {item.date}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: item.amount.startsWith('+') ? '#16a34a' : '#e11d48' },
              ]}
            >
              {item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  summaryBox: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryLabel: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 6,
  },
  summarySub: {
    color: '#bfdbfe',
    fontSize: 12,
    marginTop: 6,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  txRow: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  txSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});

