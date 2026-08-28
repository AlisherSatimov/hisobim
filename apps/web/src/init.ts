/**
 * Ilovaning init nuqtasi — main.tsx da eng birinchi import qilinadi.
 *
 * Mobil tomondagi apps/mobile/init.ts bilan bir xil sabab: bu fayl ataylab
 * `@hisobim/shared` barrel'ini emas, `@hisobim/shared/init` kirish nuqtasini
 * import qiladi. Barrel zustand store'larini ham yuklaydi, store'lar esa
 * yaratilishi bilan saqlash adapterini so'raydi — init ulardan oldin
 * bajarilishi shart.
 */
import { initHisobim } from '@hisobim/shared/init';
import { setOnline } from '@hisobim/shared/network';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY sozlanmagan. ' +
      '.env.example faylidan nusxa olib apps/web/.env yarating.'
  );
}

initHisobim({
  supabaseUrl,
  supabaseAnonKey,
  storage: window.localStorage,
  // Vebda email tasdiqlash havolasi URL orqali sessiya qaytaradi.
  detectSessionInUrl: true,
});

// Tarmoq holatini shared qatlamga uzatish (mobilda buni netinfo qiladi).
setOnline(navigator.onLine);
window.addEventListener('online', () => setOnline(true));
window.addEventListener('offline', () => setOnline(false));
