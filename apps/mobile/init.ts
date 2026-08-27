/**
 * Ilovaning init nuqtasi — app/_layout.tsx da eng birinchi import qilinadi.
 *
 * Bu fayl ataylab `@hisobim/shared` barrel'ini emas, `@hisobim/shared/init`
 * kirish nuqtasini import qiladi: barrel store'larni ham yuklaydi, store'lar
 * esa yaratilishi bilan saqlash adapterini so'raydi. Init ulardan oldin
 * bajarilishi shart.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initHisobim } from '@hisobim/shared/init';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL va EXPO_PUBLIC_SUPABASE_ANON_KEY sozlanmagan. ' +
      '.env.example faylidan nusxa olib .env yarating.'
  );
}

initHisobim({
  supabaseUrl,
  supabaseAnonKey,
  storage: AsyncStorage,
  detectSessionInUrl: false,
});
