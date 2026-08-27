import { supabase } from '../client';
import { createShop } from './shop.service';

/**
 * Ro'yxatdan o'tish: foydalanuvchi yaratiladi va unga darhol do'kon ochiladi.
 *
 * Do'kon shu yerda yaratiladi, chunki ilovaning qolgan qismi `activeShop`siz
 * ishlamaydi — yangi foydalanuvchi birinchi ekrandanoq to'liq ishlaydigan
 * holatda bo'lishi kerak.
 */
export async function signUp(email: string, password: string, shopName: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Supabase'da email tasdiqlash yoqilgan bo'lsa sessiya qaytmaydi — bunda
  // do'kon yaratib bo'lmaydi (RLS auth.uid() ni talab qiladi). Chaqiruvchi
  // buni sessiya yo'qligidan biladi va foydalanuvchiga xabar beradi.
  if (!data.session || !data.user) return { session: null, shop: null };

  const shop = await createShop(data.user.id, shopName);
  return { session: data.session, shop };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Supabase xatosini foydalanuvchiga ko'rsatiladigan o'zbekcha matnga aylantiradi.
 * Inglizcha xabar hech qachon to'g'ridan-to'g'ri ekranga chiqmaydi.
 */
export function authErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message.toLowerCase() : '';

  if (raw.includes('invalid login credentials')) {
    return "Email yoki parol noto'g'ri";
  }
  if (raw.includes('already registered') || raw.includes('already been registered')) {
    return "Bu email allaqachon ro'yxatdan o'tgan";
  }
  if (raw.includes('email not confirmed')) {
    return 'Email hali tasdiqlanmagan. Pochtangizni tekshiring';
  }
  if (
    raw.includes('failed to fetch') ||
    raw.includes('network') ||
    raw.includes('timeout')
  ) {
    return "Internet aloqasi yo'q. Ulanishni tekshiring";
  }
  if (raw.includes('rate limit') || raw.includes('too many')) {
    return "Juda ko'p urinish. Bir oz kutib, qayta urining";
  }
  return "Xatolik yuz berdi. Qayta urinib ko'ring";
}
