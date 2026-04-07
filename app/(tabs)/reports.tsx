import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useShopStore } from '../../src/stores/shop.store';
import { useReports } from '../../src/hooks/useReports';
import { formatAmount } from '../../src/utils/format';

export default function ReportsScreen() {
  const { activeShop } = useShopStore();
  const { data, isLoading } = useReports(activeShop?.id ?? '');

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1B6CA8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Umumiy qarz */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Umumiy qarzdorlik</Text>
        <Text style={styles.totalAmount}>{formatAmount(data?.totalDebt ?? 0)}</Text>
      </View>

      {/* Statistika */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data?.customerCount ?? 0}</Text>
          <Text style={styles.statLabel}>Mijoz</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data?.debtCount ?? 0}</Text>
          <Text style={styles.statLabel}>Qarz yozuvi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#27AE60' }]}>{data?.paymentCount ?? 0}</Text>
          <Text style={styles.statLabel}>To'lov</Text>
        </View>
      </View>

      {/* Top qarzdorlar */}
      {(data?.topDebtors?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eng ko'p qarzdorlar</Text>
          {data!.topDebtors.map((customer, index) => (
            <TouchableOpacity
              key={customer.id}
              style={styles.debtorRow}
              onPress={() => router.push(`/customer/${customer.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.debtorLeft}>
                <Text style={styles.debtorRank}>{index + 1}</Text>
                <View>
                  <Text style={styles.debtorName}>{customer.name}</Text>
                  {customer.phone ? (
                    <Text style={styles.debtorPhone}>{customer.phone}</Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.debtorAmount}>{formatAmount(customer.total_debt)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(data?.topDebtors?.length ?? 0) === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Hali qarzdor mijozlar yo'q</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  totalCard: {
    backgroundColor: '#1B6CA8',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 },
  totalAmount: { color: 'white', fontSize: 32, fontWeight: 'bold' },

  statsRow: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#E0E0E0' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1B6CA8' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },

  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    padding: 14,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  debtorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  debtorLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  debtorRank: { fontSize: 16, fontWeight: 'bold', color: '#CCC', width: 20 },
  debtorName: { fontSize: 15, color: '#222', fontWeight: '500' },
  debtorPhone: { fontSize: 12, color: '#999', marginTop: 1 },
  debtorAmount: { fontSize: 15, fontWeight: 'bold', color: '#C0392B' },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#999', fontSize: 15 },
});
