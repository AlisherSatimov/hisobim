import { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useShopStore, signOut, updateShopName } from '@hisobim/shared';

const APP_VERSION = '1.0.0';

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

  const phoneInitials = user?.phone?.slice(-4) ?? '??';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Profil kartasi */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{phoneInitials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profilePhone}>{user?.phone ?? '—'}</Text>
          <Text style={styles.profileRole}>Do'kon egasi</Text>
        </View>
      </View>

      {/* Do'kon sozlamalari */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DO'KON</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="storefront-outline" size={20} color="#1B6CA8" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Do'kon nomi</Text>
            {editingName ? (
              <View style={styles.editBlock}>
                <TextInput
                  value={shopName}
                  onChangeText={setShopName}
                  mode="outlined"
                  style={styles.nameInput}
                  autoFocus
                  dense
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
                <View style={styles.editActions}>
                  <Button
                    mode="contained"
                    onPress={handleSaveName}
                    loading={saving}
                    disabled={!shopName.trim() || saving}
                    style={styles.saveBtn}
                    contentStyle={styles.saveBtnContent}
                    buttonColor="#1B6CA8"
                    compact
                  >
                    Saqlash
                  </Button>
                  <Button
                    onPress={() => { setEditingName(false); setShopName(activeShop?.name ?? ''); }}
                    textColor="#9CA3AF"
                    compact
                  >
                    Bekor
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.rowValueRow}>
                <Text style={styles.rowValue}>{activeShop?.name ?? '—'}</Text>
                <Text
                  style={styles.editLink}
                  onPress={() => { setShopName(activeShop?.name ?? ''); setEditingName(true); }}
                >
                  Tahrirlash
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.row, styles.rowBorder]}>
          <View style={styles.rowIcon}>
            <Ionicons name="call-outline" size={20} color="#1B6CA8" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Telefon</Text>
            <Text style={styles.rowValue}>{user?.phone ?? '—'}</Text>
          </View>
        </View>
      </View>

      {/* Chiqish tugmasi */}
      <View style={styles.card}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          textColor="#E53935"
          style={styles.logoutButton}
          contentStyle={styles.logoutContent}
          icon="logout"
        >
          Ilovadan chiqish
        </Button>
      </View>

      {/* Versiya */}
      <Text style={styles.version}>Hisobim v{APP_VERSION}</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  content: { padding: 12, paddingBottom: 40 },

  profileCard: {
    backgroundColor: '#1B6CA8',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#1B6CA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: { fontSize: 15, fontWeight: '700', color: 'white' },
  profileInfo: { flex: 1 },
  profilePhone: { fontSize: 17, fontWeight: '700', color: 'white' },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },

  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, paddingHorizontal: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F4F6F9' },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 3 },
  rowValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowValue: { fontSize: 15, color: '#1A1A2E', fontWeight: '500', flex: 1 },
  editLink: { fontSize: 13, color: '#1B6CA8', fontWeight: '600' },

  editBlock: { marginTop: 4 },
  nameInput: { backgroundColor: 'white', marginBottom: 8 },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveBtn: { borderRadius: 8 },
  saveBtnContent: { height: 36 },

  logoutButton: { borderColor: '#E53935', borderRadius: 10, margin: 8 },
  logoutContent: { height: 50 },

  version: { textAlign: 'center', fontSize: 12, color: '#C4C4C4', marginTop: 8 },
});
