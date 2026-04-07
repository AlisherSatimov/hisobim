import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Divider, TextInput, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import { useShopStore } from '../../src/stores/shop.store';
import { signOut } from '../../src/services/auth.service';
import { updateShopName } from '../../src/services/shop.service';

export default function SettingsScreen() {
  const { user, clear: clearAuth } = useAuthStore();
  const { activeShop, setShop } = useShopStore();

  const [editingName, setEditingName] = useState(false);
  const [shopName, setShopName] = useState(activeShop?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!activeShop || !shopName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateShopName(activeShop.id, shopName.trim());
      setShop(updated);
      setEditingName(false);
    } catch {
      Alert.alert('Xatolik', "Do'kon nomini saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Chiqish", "Ilovadan chiqishni tasdiqlaysizmi?", [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } finally {
            clearAuth();
            setShop(null);
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text variant="labelMedium" style={styles.label}>DO'KON NOMI</Text>
        {editingName ? (
          <View style={styles.editRow}>
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              mode="outlined"
              style={styles.nameInput}
              autoFocus
              dense
            />
            <Button
              onPress={handleSaveName}
              loading={saving}
              disabled={!shopName.trim() || saving}
              compact
            >
              Saqlash
            </Button>
            <Button onPress={() => { setEditingName(false); setShopName(activeShop?.name ?? ''); }} compact textColor="#999">
              Bekor
            </Button>
          </View>
        ) : (
          <View style={styles.valueRow}>
            <Text variant="titleMedium" style={styles.value}>{activeShop?.name ?? '—'}</Text>
            <Button
              onPress={() => { setShopName(activeShop?.name ?? ''); setEditingName(true); }}
              compact
              textColor="#1B6CA8"
            >
              Tahrirlash
            </Button>
          </View>
        )}
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="labelMedium" style={styles.label}>TELEFON</Text>
        <Text variant="titleMedium" style={styles.value}>{user?.phone ?? '—'}</Text>
      </View>

      <Divider />

      <View style={styles.logoutSection}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          textColor="#C0392B"
          style={styles.logoutButton}
          contentStyle={styles.buttonContent}
          icon="logout"
        >
          Chiqish
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  section: { padding: 16 },
  label: { color: '#999', fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  value: { fontSize: 17, color: '#222' },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nameInput: { flex: 1, backgroundColor: 'white', fontSize: 16 },
  logoutSection: { padding: 24, marginTop: 16 },
  logoutButton: { borderColor: '#C0392B', borderRadius: 8 },
  buttonContent: { height: 52 },
});
