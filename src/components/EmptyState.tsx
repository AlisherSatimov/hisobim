import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  message: string;
  subMessage?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function EmptyState({ message, subMessage, icon = 'people-outline' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color="#D1D5DB" />
      </View>
      <Text style={styles.message}>{message}</Text>
      {subMessage ? <Text style={styles.sub}>{subMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  message: { fontSize: 17, color: '#6B7280', textAlign: 'center', fontWeight: '500' },
  sub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 6 },
});
