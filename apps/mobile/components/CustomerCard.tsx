import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatAmount, type Customer } from '@hisobim/shared';

type Props = {
  customer: Customer;
  onPress: () => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function CustomerCard({ customer, onPress }: Props) {
  const hasDebt = customer.total_debt > 0;
  const debtColor = hasDebt ? '#E53935' : '#43A047';
  const initials = getInitials(customer.name);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.accent, { backgroundColor: debtColor }]} />
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
        {customer.phone ? (
          <Text style={styles.phone} numberOfLines={1}>{customer.phone}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={[styles.debt, { color: debtColor }]}>
          {formatAmount(customer.total_debt)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#CCC" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF3FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B6CA8',
  },
  info: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  name: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  phone: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  right: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignSelf: 'center',
    paddingRight: 8,
    gap: 2,
  },
  debt: { fontSize: 14, fontWeight: '700' },
  chevron: { marginTop: 1 },
});
