import { supabase } from '../client';

function normalizeUzbekPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+998${digits.slice(1)}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

export async function sendOtp(phone: string): Promise<void> {
  const normalized = normalizeUzbekPhone(phone);
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
  if (error) throw error;
}

export async function verifyOtp(phone: string, token: string) {
  const normalized = normalizeUzbekPhone(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: 'sms',
  });
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
