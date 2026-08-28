// Supabase client va saqlash adapteri shu importda ulanadi —
// @hisobim/shared dan hech narsa undan oldin yuklanmasligi kerak.
import '../init';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { supabase, useAuthStore, setOnline, startOutboxSync } from '@hisobim/shared';
import OfflineBanner from '../components/OfflineBanner';

const CACHE_TIME = 1000 * 60 * 60 * 24 * 7; // 7 kun

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Internetsiz ochilganda oxirgi holat ko'rinishi uchun kesh
      // yetarlicha uzoq saqlanadi.
      staleTime: 1000 * 60 * 5,
      gcTime: CACHE_TIME,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'hisobim-query-cache',
});

const hisobimTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B6CA8',
    secondary: '#E8A020',
    error: '#C0392B',
  },
};

export default function RootLayout() {
  const { setSession } = useAuthStore();

  // Tarmoq holati: netinfo -> React Query va shared network qatlami.
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      onlineManager.setOnline(online);
      setOnline(online);
    });
  }, []);

  // Aloqa qaytganda navbatdagi yozuvlar yuboriladi.
  useEffect(() => startOutboxSync(queryClient), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_TIME }}
    >
      <PaperProvider theme={hisobimTheme}>
        <StatusBar style="dark" />
        <OfflineBanner />
        <Stack screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: 'white' },
          headerTitleStyle: { fontWeight: '700', fontSize: 17, color: '#1A1A2E' },
          headerTintColor: '#1B6CA8',
          headerShadowVisible: false,
          headerBackTitle: '',
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
          <Stack.Screen name="customer/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="customer/add" options={{ headerShown: true, title: "Mijoz qo'shish" }} />
          <Stack.Screen name="debt/add" options={{ headerShown: true, title: "Yozuv qo'shish" }} />
          <Stack.Screen name="customer/edit" options={{ headerShown: true }} />
        </Stack>
      </PaperProvider>
    </PersistQueryClientProvider>
  );
}
