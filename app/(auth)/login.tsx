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
import { router } from 'expo-router';
import { loginSchema } from '../../src/utils/validation';
import { sendOtp, getSession } from '../../src/services/auth.service';

type FormData = { phone: string };

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async ({ phone }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await sendOtp(phone);
      // phone confirmations OFF bo'lsa session darhol yaratiladi
      const session = await getSession();
      if (session) {
        router.replace('/(tabs)/');
      } else {
        router.push({ pathname: '/(auth)/verify', params: { phone } });
      }
    } catch {
      setErrorMsg("SMS yuborishda xatolik. Iltimos, qayta urinib ko'ring.");
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
        <Text variant="displaySmall" style={styles.logo}>Hisobim</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Telefon raqamingizni kiriting
        </Text>

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Telefon raqam"
              placeholder="90 123 45 67"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              error={!!errors.phone}
              style={styles.input}
              left={<TextInput.Affix text="+998 " />}
              mode="outlined"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone?.message}
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
          Davom etish
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'white' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logo: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold', color: '#1B6CA8' },
  subtitle: { textAlign: 'center', marginBottom: 32, color: '#666' },
  input: { fontSize: 18 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { height: 52 },
});
