import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';

const curatedFoods = [
  { id: '1', name: 'Steamed Idli (2 pcs)', calories: '130 kcal', protein: '4.2g', sugar: '0.4g' },
  { id: '2', name: 'Vegetable Sambar Bowl', calories: '130 kcal', protein: '6.2g', sugar: '2.8g' },
  { id: '3', name: 'Plain Masala Dosa', calories: '210 kcal', protein: '4.5g', sugar: '1.1g' },
  { id: '4', name: 'Curd Rice (Fresh Dahi)', calories: '190 kcal', protein: '4.8g', sugar: '2.3g' },
  { id: '5', name: 'Paneer Tikka (150g)', calories: '280 kcal', protein: '18.0g', sugar: '1.2g' },
];

export default function MobileNutrition() {
  const [search, setSearch] = useState('');

  const filtered = curatedFoods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search Indian foods (Idli, Sambar, Dosa)..."
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity style={styles.barcodeBtn}>
        <Text style={styles.barcodeText}>📷 Scan Food Barcode (Open Food Facts)</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Indian Food Directory</Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.foodCard}>
            <View>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodNutrients}>
                {item.calories} • {item.protein} Protein • {item.sugar} Sugar
              </Text>
            </View>
            <TouchableOpacity style={styles.logBtn}>
              <Text style={styles.logBtnText}>+ Log</Text>
            </TouchableOpacity>
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
  search: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  barcodeBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  barcodeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  foodCard: {
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
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  foodNutrients: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  logBtn: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
});

