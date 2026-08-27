// Supabase client va saqlash adapteri shu importda ulanadi —
// @hisobim/shared dan hech narsa undan oldin yuklanmasligi kerak.
import '../init';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { supabase, useAuthStore } from '@hisobim/shared';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
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
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={hisobimTheme}>
        <StatusBar style="dark" />
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
          <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
          <Stack.Screen name="customer/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="customer/add" options={{ headerShown: true, title: "Mijoz qo'shish" }} />
          <Stack.Screen name="debt/add" options={{ headerShown: true, title: "Yozuv qo'shish" }} />
          <Stack.Screen name="customer/edit" options={{ headerShown: true }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
