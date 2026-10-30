import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MobileDashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back 👋</Text>
        <Text style={styles.subgreeting}>Here is your synchronized overview for today</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.cardsRow}>
        <View style={[styles.card, { borderColor: '#e0e7ff', backgroundColor: '#eef2ff' }]}>
          <Text style={styles.cardLabel}>NET SAVINGS</Text>
          <Text style={styles.cardValue}>₹42,750</Text>
          <Text style={styles.cardSub}>+14.2% this month</Text>
        </View>

        <View style={[styles.card, { borderColor: '#dcfce7', backgroundColor: '#f0fdf4' }]}>
          <Text style={styles.cardLabel}>CALORIES</Text>
          <Text style={styles.cardValue}>1,840</Text>
          <Text style={styles.cardSub}>/ 2,200 kcal</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { borderColor: '#ffe4e6', backgroundColor: '#fff1f2' }]}>
          <Text style={styles.cardLabel}>SUGAR INTAKE</Text>
          <Text style={styles.cardValue}>28g</Text>
          <Text style={styles.cardSub}>/ 36g max</Text>
        </View>

        <View style={[styles.card, { borderColor: '#e0f2fe', backgroundColor: '#f0f9ff' }]}>
          <Text style={styles.cardLabel}>WATER LOG</Text>
          <Text style={styles.cardValue}>2.2L</Text>
          <Text style={styles.cardSub}>/ 3.0L goal</Text>
        </View>
      </View>

      {/* Recent Meals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Logged Meals</Text>

        <View style={styles.mealItem}>
          <View>
            <Text style={styles.mealName}>Idli & Sambar (3 pcs)</Text>
            <Text style={styles.mealMeta}>Breakfast • 310 kcal</Text>
          </View>
          <Text style={styles.sugarBadge}>1.8g sugar</Text>
        </View>

        <View style={styles.mealItem}>
          <View>
            <Text style={styles.mealName}>Brown Rice & Dal Tadka</Text>
            <Text style={styles.mealMeta}>Lunch • 540 kcal</Text>
          </View>
          <Text style={styles.sugarBadge}>2.1g sugar</Text>
        </View>

        <View style={styles.mealItem}>
          <View>
            <Text style={styles.mealName}>Chapati & Paneer Bhurji</Text>
            <Text style={styles.mealMeta}>Dinner • 480 kcal</Text>
          </View>
          <Text style={styles.sugarBadge}>3.4g sugar</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subgreeting: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 6,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  mealMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  sugarBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e11d48',
  },
});

