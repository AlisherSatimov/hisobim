import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, router } from 'expo-router';
import { otpSchema } from '../../src/utils/validation';
import { verifyOtp } from '../../src/services/auth.service';

type FormData = { otp: string };

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = async ({ otp }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await verifyOtp(phone ?? '', otp);
      router.replace('/(tabs)/');
    } catch {
      setErrorMsg("Kod noto'g'ri yoki muddati o'tgan. Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          SMS kodni kiriting
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {phone} raqamiga 6 xonali kod yuborildi
        </Text>

        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Tasdiqlash kodi"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={value}
              onChangeText={onChange}
              error={!!errors.otp}
              style={styles.input}
              mode="outlined"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.otp}>
          {errors.otp?.message}
        </HelperText>

        {errorMsg ? (
          <HelperText type="error" visible>
            {errorMsg}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Kirish
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Orqaga
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'white' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginBottom: 32, color: '#666' },
  input: { fontSize: 22, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { height: 52 },
  backButton: { marginTop: 8 },
});
