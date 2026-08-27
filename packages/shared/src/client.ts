import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getStorageAdapter, setStorageAdapter, type StorageAdapter } from './storage';

let client: SupabaseClient | null = null;

export type HisobimConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** Mobilda AsyncStorage, vebda localStorage adapteri */
  storage: StorageAdapter;
  /**
   * URL dagi sessiya tokenini avtomatik o'qish.
   * Vebda true (email tasdiqlash havolasi shu orqali qaytadi), mobilda false.
   */
  detectSessionInUrl?: boolean;
};

/**
 * Ilovaning yagona init nuqtasi. Mobil tomonda app/_layout.tsx da,
 * veb tomonda main.tsx da bir marta chaqiriladi.
 */
export function initHisobim(config: HisobimConfig): SupabaseClient {
  setStorageAdapter(config.storage);

  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: getStorageAdapter() as never,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: config.detectSessionInUrl ?? false,
    },
  });

  return client;
}

export function getClient(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase client ulanmagan. Ilova boshlanishida initHisobim() ni chaqiring."
    );
  }
  return client;
}

/**
 * Servislar uchun kechiktirilgan (lazy) client.
 *
 * Client ilova ishga tushganda initHisobim() orqali yaratiladi, ya'ni
 * servis modullari yuklanayotgan paytda u hali mavjud emas. Bu proxy
 * har murojaatda haqiqiy clientni oladi, shuning uchun servislar uni
 * odatdagi obyekt kabi ishlatadi: supabase.from('customers')...
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const instance = getClient();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
