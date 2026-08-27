import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { formatAmount, formatDate, type Debt } from '@hisobim/shared';

type Props = {
  debt: Debt;
  onDelete: () => void;
};

export default function DebtItem({ debt, onDelete }: Props) {
  const isPayment = debt.amount < 0;
  const amountColor = isPayment ? '#27AE60' : '#C0392B';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatAmount(Math.abs(debt.amount))}
        </Text>
        <TouchableOpacity onPress={onDelete} hitSlop={10}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      {debt.description ? (
        <Text style={styles.description} numberOfLines={1}>{debt.description}</Text>
      ) : null}
      <Text style={styles.date}>{formatDate(debt.created_at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 7,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  amount: { fontSize: 13, fontWeight: 'bold', flex: 1, marginRight: 2 },
  description: { fontSize: 11, color: '#555', marginBottom: 1 },
  date: { fontSize: 10, color: '#999' },
  deleteText: { fontSize: 12, color: '#C0392B' },
});
