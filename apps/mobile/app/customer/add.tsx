import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { addCustomerSchema, useCreateCustomer, useShopStore } from '@hisobim/shared';

type FormData = { name: string; phone?: string; note?: string };

export default function AddCustomerScreen() {
  const { activeShop } = useShopStore();
  const createCustomer = useCreateCustomer(activeShop?.id ?? '');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: { name: '', phone: '', note: '' },
  });

  const onSubmit = async ({ name, phone, note }: FormData) => {
    if (!activeShop) return;
    await createCustomer.mutateAsync({
      shop_id: activeShop.id,
      name,
      phone: phone || null,
      note: note || null,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Mijoz qo'shish" }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Ism *"
                value={value}
                onChangeText={onChange}
                error={!!errors.name}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message}
          </HelperText>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Telefon (ixtiyoriy)"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                error={!!errors.phone}
                style={styles.input}
                mode="outlined"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone?.message}
          </HelperText>

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Izoh (ixtiyoriy)"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createCustomer.isPending}
            disabled={createCustomer.isPending}
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
  input: { fontSize: 16, marginTop: 4 },
  button: { marginTop: 16, borderRadius: 8, backgroundColor: '#1B6CA8' },
  buttonContent: { height: 52 },
});
