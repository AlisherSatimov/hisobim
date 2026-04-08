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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { loginSchema } from '../../src/utils/validation';
import { sendOtp, getSession } from '../../src/services/auth.service';

type FormData = { phone: string };

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async ({ phone }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await sendOtp(phone);
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
              <Ionicons name="receipt-outline" size={36} color="white" />
            </View>
            <Text style={styles.appName}>Hisobim</Text>
            <Text style={styles.tagline}>Do'koningiz uchun raqamli daftar</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kirish</Text>
            <Text style={styles.cardSub}>Telefon raqamingizni kiriting</Text>

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
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone?.message}
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
              Davom etish
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
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },

  card: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 24 },

  input: { backgroundColor: 'white', fontSize: 16 },
  button: { marginTop: 8, borderRadius: 10 },
  buttonContent: { height: 52 },
});
