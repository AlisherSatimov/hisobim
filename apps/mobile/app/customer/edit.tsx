import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useCustomerById, useUpdateCustomer, useShopStore } from '@hisobim/shared';

export default function CustomerEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeShop } = useShopStore();
  const { data: customer } = useCustomerById(id, activeShop?.id);
  const updateCustomer = useUpdateCustomer(activeShop?.id ?? '', id);

  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [note, setNote] = useState(customer?.note ?? '');

  const nameError = name.trim().length === 0;

  const handleSave = () => {
    if (nameError) return;
    updateCustomer.mutate(
      { name: name.trim(), phone: phone.trim() || null, note: note.trim() || null },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Mijozni tahrirlash' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TextInput
            label="Ism *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={nameError && name.length > 0}
            autoFocus
          />
          {nameError && name.length > 0 && (
            <HelperText type="error">Ism kiritilishi shart</HelperText>
          )}

          <TextInput
            label="Telefon raqam"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="+998 90 123 45 67"
          />

          <TextInput
            label="Izoh"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={updateCustomer.isPending}
            disabled={nameError || updateCustomer.isPending}
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
  input: { marginBottom: 12, backgroundColor: 'white' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { height: 52 },
});
