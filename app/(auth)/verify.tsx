import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { otpSchema } from '../../src/utils/validation';
import { verifyOtp } from '../../src/services/auth.service';

type FormData = { otp: string };

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Brand section */}
          <View style={styles.brand}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark-outline" size={36} color="white" />
            </View>
            <Text style={styles.title}>Tasdiqlash</Text>
            <Text style={styles.subtitle}>{phone} raqamiga{'\n'}6 xonali kod yuborildi</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kodni kiriting</Text>

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
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.otp}>
              {errors.otp?.message}
            </HelperText>

            {errorMsg ? (
              <HelperText type="error" visible>{errorMsg}</HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor="#1B6CA8"
            >
              Kirish
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              style={styles.backButton}
              textColor="#9CA3AF"
            >
              ← Orqaga
            </Button>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1B6CA8' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  brand: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    backgroundColor: '#1B6CA8',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: 'white' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  card: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 20 },

  input: { backgroundColor: 'white', fontSize: 24, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { height: 52 },
  backButton: { marginTop: 8 },
});
