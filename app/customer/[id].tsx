import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Divider, ActivityIndicator, Appbar } from 'react-native-paper';
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
  const { data: customer, isLoading: customerLoading } = useCustomerById(id);
  const { data: debts = [], isLoading: debtsLoading } = useDebts(id);
  const deleteDebt = useDeleteDebt(id);
  const deleteCustomer = useDeleteCustomer(activeShop?.id ?? '');

  const handleDeleteDebt = (debtId: string) => {
    Alert.alert(
      "Yozuvni o'chirish",
      "Bu yozuvni o'chirishni tasdiqlaysizmi?",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => deleteDebt.mutate(debtId),
        },
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
          onPress: () => {
            deleteCustomer.mutate(id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ]
    );
  };

  const debtColor = customer && customer.total_debt > 0 ? '#C0392B' : '#27AE60';

  return (
    <>
      <Stack.Screen
        options={{
          title: customer?.name ?? 'Mijoz',
          headerRight: () => customer ? (
            <>
              <Appbar.Action
                icon="pencil-outline"
                iconColor="#1B6CA8"
                onPress={() => router.push({ pathname: '/customer/edit', params: { id } })}
              />
              <Appbar.Action
                icon="delete-outline"
                iconColor="#C0392B"
                onPress={handleDeleteCustomer}
              />
            </>
          ) : null,
        }}
      />
      {customerLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1B6CA8" />
        </View>
      ) : !customer ? null : (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {customer.name.trim().split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{customer.name}</Text>
            {customer.phone ? <Text style={styles.phone}>{customer.phone}</Text> : null}
            {customer.note ? <Text style={styles.note}>{customer.note}</Text> : null}
          </View>
          <View style={[styles.debtBox, { backgroundColor: debtColor + '15' }]}>
            <Text style={styles.debtLabel}>Jami qarz</Text>
            <Text style={[styles.debtAmount, { color: debtColor }]}>
              {formatAmount(customer.total_debt)}
            </Text>
          </View>
        </View>

        <Divider />

        <ScrollView contentContainerStyle={styles.list}>
          {debts.length === 0 && !debtsLoading ? (
            <EmptyState message="Hali yozuv yo'q" subMessage="Quyidagi tugmani bosing" />
          ) : (
            <View style={styles.columns}>
              <View style={styles.column}>
                <Text style={[styles.colHeader, { color: '#C0392B' }]}>Qarz oldi</Text>
                {debts.filter(d => d.amount > 0).map(item => (
                  <DebtItem key={item.id} debt={item} onDelete={() => handleDeleteDebt(item.id)} />
                ))}
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.column}>
                <Text style={[styles.colHeader, { color: '#27AE60' }]}>To'lov qildi</Text>
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
          onPress={() =>
            router.push({ pathname: '/debt/add', params: { customerId: id } })
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF3FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#1B6CA8' },
  headerInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  phone: { color: '#9CA3AF', marginTop: 2, fontSize: 14 },
  note: { color: '#9CA3AF', marginTop: 2, fontSize: 13, fontStyle: 'italic' },
  debtBox: { alignItems: 'flex-end', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  debtLabel: { color: '#9CA3AF', fontSize: 11, marginBottom: 2 },
  debtAmount: { fontSize: 15, fontWeight: '800' },
  list: { padding: 8, paddingBottom: 100 },
  emptyList: { flex: 1 },
  columns: { flexDirection: 'row' },
  column: { flex: 1, minWidth: 0 },
  colHeader: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: 2 },
  dividerVertical: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 6 },
  addButton: { margin: 16, borderRadius: 8, backgroundColor: '#1B6CA8' },
  buttonContent: { height: 52 },
});
