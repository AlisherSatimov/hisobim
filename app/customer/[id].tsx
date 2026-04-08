import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useCustomerById, useDeleteCustomer } from '../../src/hooks/useCustomers';
import { useDebts, useDeleteDebt } from '../../src/hooks/useDebts';
import { useShopStore } from '../../src/stores/shop.store';
import DebtItem from '../../src/components/DebtItem';
import EmptyState from '../../src/components/EmptyState';
import { formatAmount } from '../../src/utils/format';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeShop } = useShopStore();
  const { data: customer, isLoading: customerLoading } = useCustomerById(id, activeShop?.id);
  const { data: debts = [], isLoading: debtsLoading } = useDebts(id);
  const deleteDebt = useDeleteDebt(id);
  const deleteCustomer = useDeleteCustomer(activeShop?.id ?? '');

  const initials = customer
    ? customer.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '';

  const handleDeleteDebt = (debtId: string) => {
    Alert.alert(
      "Yozuvni o'chirish",
      "Bu yozuvni o'chirishni tasdiqlaysizmi?",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: "O'chirish", style: 'destructive', onPress: () => deleteDebt.mutate(debtId) },
      ]
    );
  };

  const handleDeleteCustomer = () => {
    Alert.alert(
      "Mijozni o'chirish",
      `${customer?.name} va barcha qarzlarini o'chirishni tasdiqlaysizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => deleteCustomer.mutate(id, { onSuccess: () => router.back() }),
        },
      ]
    );
  };

  const debtColor = customer && customer.total_debt > 0 ? '#E53935' : '#43A047';

  return (
    <>
      <Stack.Screen
        options={{
          headerTitleAlign: 'left',
          headerTitle: () => customer ? (
            <View style={styles.headerTitle}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.headerName} numberOfLines={1}>{customer.name}</Text>
                {customer.phone ? (
                  <Text style={styles.headerPhone} numberOfLines={1}>{customer.phone}</Text>
                ) : null}
              </View>
            </View>
          ) : null,
          headerRight: () => customer ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => router.push({ pathname: '/customer/edit', params: { id } })}
                hitSlop={6}
              >
                <Ionicons name="pencil-outline" size={20} color="#1B6CA8" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleDeleteCustomer}
                hitSlop={6}
              >
                <Ionicons name="trash-outline" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          ) : null,
        }}
      />

      {customerLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1B6CA8" />
        </View>
      ) : !customer ? null : (
        <View style={styles.container}>

          {/* Qarz banneri */}
          <View style={[styles.debtBanner, { backgroundColor: debtColor }]}>
            <Text style={styles.debtBannerLabel}>Jami qarz</Text>
            <Text style={styles.debtBannerAmount}>{formatAmount(customer.total_debt)}</Text>
          </View>

          {/* Ikki ustunli daftar */}
          <ScrollView contentContainerStyle={styles.list}>
            {debts.length === 0 && !debtsLoading ? (
              <EmptyState
                message="Hali yozuv yo'q"
                subMessage="Quyidagi tugmani bosing"
                icon="document-text-outline"
              />
            ) : (
              <View style={styles.columns}>
                <View style={styles.column}>
                  <Text style={[styles.colHeader, { color: '#E53935' }]}>Qarz oldi</Text>
                  {debts.filter(d => d.amount > 0).map(item => (
                    <DebtItem key={item.id} debt={item} onDelete={() => handleDeleteDebt(item.id)} />
                  ))}
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.column}>
                  <Text style={[styles.colHeader, { color: '#43A047' }]}>To'lov qildi</Text>
                  {debts.filter(d => d.amount < 0).map(item => (
                    <DebtItem key={item.id} debt={item} onDelete={() => handleDeleteDebt(item.id)} />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <Button
            mode="contained"
            icon="plus"
            style={styles.addButton}
            contentStyle={styles.buttonContent}
            onPress={() => router.push({ pathname: '/debt/add', params: { customerId: id } })}
          >
            Yozuv qo'shish
          </Button>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Nav header
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF3FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#1B6CA8' },
  headerTexts: { justifyContent: 'center', gap: 1 },
  headerName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', lineHeight: 18 },
  headerPhone: { fontSize: 12, color: '#9CA3AF', lineHeight: 15 },
  headerActions: { flexDirection: 'row', gap: 4, marginRight: 4 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F6F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Debt banner
  debtBanner: {
    margin: 12,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  debtBannerLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  debtBannerAmount: { color: 'white', fontSize: 20, fontWeight: '800' },

  // Columns
  list: { padding: 8, paddingBottom: 100 },
  columns: { flexDirection: 'row' },
  column: { flex: 1, minWidth: 0 },
  colHeader: {
    fontSize: 11, fontWeight: '700', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: 2,
  },
  dividerVertical: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 6 },

  addButton: { margin: 12, borderRadius: 10, backgroundColor: '#1B6CA8' },
  buttonContent: { height: 52 },
});
