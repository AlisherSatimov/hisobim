import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { subscribeOnline, getOnline, useOutboxStore, pendingCount } from '@hisobim/shared';

/**
 * Aloqa holati va yuborilmagan yozuvlar soni. Barcha ekranlar ustida turadi.
 * Navbat bo'sh bo'lsa va aloqa bor bo'lsa — hech narsa ko'rsatilmaydi.
 */
export default function OfflineBanner() {
  const [online, setOnlineState] = useState(getOnline);
  const items = useOutboxStore((s) => s.items);

  useEffect(() => subscribeOnline(setOnlineState), []);

  const pending = pendingCount(items);
  const failed = items.length - pending;

  if (online && pending === 0 && failed === 0) return null;

  const text = !online
    ? pending > 0
      ? `Aloqa yo'q — ${pending} ta yozuv navbatda`
      : "Aloqa yo'q — yozuvlar keyin yuboriladi"
    : pending > 0
      ? `${pending} ta yozuv yuborilmoqda…`
      : `${failed} ta yozuv yuborilmadi`;

  const isFailedState = online && failed > 0 && pending === 0;

  return (
    <View style={[styles.banner, isFailedState ? styles.error : null]}>
      <Text style={[styles.text, isFailedState ? styles.errorText : null]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E8A020',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  error: {
    backgroundColor: '#C0392B',
  },
  errorText: {
    color: '#FFFFFF',
  },
  text: {
    color: '#3B2600',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
