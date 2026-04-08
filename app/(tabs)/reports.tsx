import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useShopStore } from '../../src/stores/shop.store';
import { useReports } from '../../src/hooks/useReports';
import { formatAmount } from '../../src/utils/format';
import EmptyState from '../../src/components/EmptyState';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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

  const hasDebtors = (data?.topDebtors?.length ?? 0) > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Umumiy qarzdorlik kartasi */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Umumiy qarzdorlik</Text>
        <Text style={styles.totalAmount}>{formatAmount(data?.totalDebt ?? 0)}</Text>
        <Text style={styles.totalSub}>{data?.debtorCount ?? 0} ta mijoz qarzdor</Text>
      </View>

      {/* Statistika */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data?.customerCount ?? 0}</Text>
          <Text style={styles.statLabel}>Jami mijoz</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#E53935' }]}>{data?.debtorCount ?? 0}</Text>
          <Text style={styles.statLabel}>Qarzdor</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#43A047' }]}>{data?.clearedCount ?? 0}</Text>
          <Text style={styles.statLabel}>To'liq to'lagan</Text>
        </View>
      </View>

      {/* Top qarzdorlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eng ko'p qarzdorlar</Text>
        {hasDebtors ? (
          data!.topDebtors.map((customer, index) => (
            <TouchableOpacity
              key={customer.id}
              style={styles.debtorRow}
              onPress={() => router.push(`/customer/${customer.id}`)}
              activeOpacity={0.6}
            >
              <Text style={styles.debtorRank}>{index + 1}</Text>
              <View style={styles.debtorAvatar}>
                <Text style={styles.debtorAvatarText}>{getInitials(customer.name)}</Text>
              </View>
              <View style={styles.debtorInfo}>
                <Text style={styles.debtorName} numberOfLines={1}>{customer.name}</Text>
                {customer.phone ? (
                  <Text style={styles.debtorPhone}>{customer.phone}</Text>
                ) : null}
              </View>
              <Text style={styles.debtorAmount}>{formatAmount(customer.total_debt)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCC" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            message="Qarzdor mijozlar yo'q"
            subMessage="Barcha mijozlar hisobini tozalagan"
            icon="checkmark-circle-outline"
          />
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  content: { padding: 12, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  totalCard: {
    backgroundColor: '#1B6CA8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#1B6CA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  totalLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 6 },
  totalAmount: { color: 'white', fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  totalSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6 },

  statsRow: {
    backgroundColor: 'white',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0' },
  statNumber: { fontSize: 26, fontWeight: '800', color: '#1B6CA8' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

  section: {
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    padding: 14,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  debtorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F4F6F9',
  },
  debtorRank: { fontSize: 13, fontWeight: '700', color: '#D1D5DB', width: 18, marginRight: 8 },
  debtorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF3FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  debtorAvatarText: { fontSize: 12, fontWeight: '800', color: '#1B6CA8' },
  debtorInfo: { flex: 1 },
  debtorName: { fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
  debtorPhone: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  debtorAmount: { fontSize: 14, fontWeight: '700', color: '#E53935' },
});
