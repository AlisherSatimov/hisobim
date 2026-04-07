import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';

export default function AuthLayout() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1B6CA8" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
