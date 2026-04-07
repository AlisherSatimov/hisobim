import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { addDebtSchema } from '../../src/utils/validation';
import { useCreateDebt } from '../../src/hooks/useDebts';
import { useAuthStore } from '../../src/stores/auth.store';
import { useShopStore } from '../../src/stores/shop.store';
import { formatAmount } from '../../src/utils/format';

type EntryType = 'debt' | 'payment';
type FormData = { amount: string; description?: string };

export default function AddDebtScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const [entryType, setEntryType] = useState<EntryType>('debt');
  const { user } = useAuthStore();
  const { activeShop } = useShopStore();
  const createDebt = useCreateDebt(customerId, user?.id ?? '');
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addDebtSchema),
    defaultValues: { amount: '', description: '' },
  });

  const rawAmount = watch('amount');
  const parsedAmount = Number(rawAmount);
  const displayAmount =
    rawAmount && !isNaN(parsedAmount) && parsedAmount > 0
      ? formatAmount(entryType === 'payment' ? -parsedAmount : parsedAmount)
      : '';

  const onSubmit = async ({ amount, description }: FormData) => {
    if (!activeShop || !customerId) return;
    const numeric = Number(amount);
    const finalAmount = entryType === 'payment' ? -numeric : numeric;
    await createDebt.mutateAsync({
      shop_id: activeShop.id,
      customer_id: customerId,
      amount: finalAmount,
      description: description || null,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yozuv qo\'shish' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <SegmentedButtons
          value={entryType}
          onValueChange={(v) => setEntryType(v as EntryType)}
          style={styles.segmented}
          buttons={[
            { value: 'debt', label: 'Qarz qildi' },
            { value: 'payment', label: "To'lov qildi" },
          ]}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Summa (so'm)"
              keyboardType="numeric"
              value={value}
              onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
              error={!!errors.amount}
              style={styles.amountInput}
              mode="outlined"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.amount}>
          {errors.amount?.message}
        </HelperText>

        {displayAmount ? (
          <Text
            variant="headlineSmall"
            style={[
              styles.preview,
              { color: entryType === 'payment' ? '#27AE60' : '#C0392B' },
            ]}
          >
            {displayAmount}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Izoh (ixtiyoriy)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              mode="outlined"
            />
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createDebt.isPending}
          disabled={createDebt.isPending}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Saqlash
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'white' },
  container: { padding: 16 },
  segmented: { marginBottom: 16 },
  amountInput: { fontSize: 22 },
  preview: { textAlign: 'center', marginVertical: 8, fontWeight: 'bold' },
  input: { marginTop: 8, fontSize: 16 },
  button: { marginTop: 24, borderRadius: 8, backgroundColor: '#1B6CA8' },
  buttonContent: { height: 52 },
});
