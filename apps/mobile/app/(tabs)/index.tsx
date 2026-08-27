import { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  useAuthStore,
  useShopStore,
  useCustomers,
  fetchOrCreateShop,
  formatAmount,
  type Customer,
} from '@hisobim/shared';
import CustomerCard from '../../components/CustomerCard';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { activeShop, setShop } = useShopStore();
  const { data: customers = [], isLoading, refetch } = useCustomers(activeShop?.id ?? '');

  useEffect(() => {
    if (!user || activeShop) return;
    fetchOrCreateShop(user.id).then(setShop);
  }, [user, activeShop]);

  const filtered: Customer[] = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone ?? '').includes(searchQuery)
  );

  const totalDebt = customers.reduce((sum, c) => sum + c.total_debt, 0);

  if (!activeShop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B6CA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.shopHeader}>
        <View>
          <Text style={styles.shopName}>{activeShop.name}</Text>
          <Text style={styles.shopMeta}>{customers.length} ta mijoz</Text>
        </View>
        {totalDebt > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Jami qarz</Text>
            <Text style={styles.totalAmount}>{formatAmount(totalDebt)}</Text>
          </View>
        )}
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push(`/customer/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            message={searchQuery ? 'Hech narsa topilmadi' : "Hali mijoz yo'q"}
            subMessage={searchQuery ? undefined : "Qo'shish uchun + tugmasini bosing"}
            icon={searchQuery ? 'search-outline' : 'people-outline'}
          />
        }
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyList : styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/customer/add')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  shopName: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  shopMeta: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  totalBadge: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: '#9CA3AF' },
  totalAmount: { fontSize: 15, fontWeight: '700', color: '#E53935' },

  list: { paddingTop: 8, paddingBottom: 80 },
  emptyList: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#1B6CA8' },
});
