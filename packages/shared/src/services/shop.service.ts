import { supabase } from '../client';
import type { Shop } from '../types';

export async function updateShopName(shopId: string, name: string): Promise<Shop> {
  const { data, error } = await supabase
    .from('shops')
    .update({ name })
    .eq('id', shopId)
    .select()
    .single();
  if (error) throw error;
  return data as Shop;
}

export async function createShop(ownerId: string, name: string): Promise<Shop> {
  const { data, error } = await supabase
    .from('shops')
    .insert({
      owner_id: ownerId,
      name,
      phone: null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Shop;
}

/**
 * Zaxira yo'l: ro'yxatdan o'tishda do'kon yaratilgan bo'lishi kerak, lekin
 * eski hisoblar yoki uzilib qolgan sign-up uchun bu yerda ham yaratiladi.
 */
export async function fetchOrCreateShop(ownerId: string): Promise<Shop> {
  const { data: existing } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (existing) return existing as Shop;

  return createShop(ownerId, "Mening do'konim");
}
