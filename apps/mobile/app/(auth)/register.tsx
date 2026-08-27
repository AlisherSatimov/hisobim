import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signUpSchema, signUp, authErrorMessage, useShopStore } from '@hisobim/shared';

type FormData = {
  shopName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setShop = useShopStore((s) => s.setShop);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { shopName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ shopName, email, password }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const { session, shop } = await signUp(email.trim(), password, shopName.trim());

      // Sessiya yo'q = Supabase'da email tasdiqlash yoqilgan. Bunda do'kon ham
      // yaratilmagan, foydalanuvchi pochtasini tasdiqlab, keyin kirishi kerak.
      if (!session) {
        setInfoMsg(
          "Hisob yaratildi. Pochtangizga yuborilgan xatni tasdiqlab, keyin kiring."
        );
        return;
      }

      setShop(shop);
      router.replace('/(tabs)/');
    } catch (err) {
      setErrorMsg(authErrorMessage(err));
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
              <Ionicons name="storefront-outline" size={36} color="white" />
            </View>
            <Text style={styles.appName}>Hisobim</Text>
            <Text style={styles.tagline}>Do'koningiz uchun raqamli daftar</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ro'yxatdan o'tish</Text>
            <Text style={styles.cardSub}>Do'koningiz uchun hisob yarating</Text>

            <Controller
              control={control}
              name="shopName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Do'kon nomi"
                  placeholder="Baraka do'koni"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.shopName}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.shopName}>
              {errors.shopName?.message}
            </HelperText>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="misol@pochta.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.email}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email?.message}
            </HelperText>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Parol"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.password}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword((v) => !v)}
                    />
                  }
                />
              )}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Parolni tasdiqlang"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.confirmPassword}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#1B6CA8"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword?.message}
            </HelperText>

            {errorMsg ? (
              <HelperText type="error" visible>{errorMsg}</HelperText>
            ) : null}
            {infoMsg ? (
              <HelperText type="info" visible>{infoMsg}</HelperText>
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
              Ro'yxatdan o'tish
            </Button>

            <Pressable
              onPress={() => router.back()}
              disabled={isLoading}
              style={styles.linkWrap}
            >
              <Text style={styles.linkText}>
                Hisobingiz bormi? <Text style={styles.linkAccent}>Kiring</Text>
              </Text>
            </Pressable>
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
    paddingTop: 40,
    paddingBottom: 32,
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

  linkWrap: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkAccent: { color: '#1B6CA8', fontWeight: '700' },
});
