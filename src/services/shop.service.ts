import { supabase } from '../lib/supabase';
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

export async function fetchOrCreateShop(ownerId: string, phone: string | null): Promise<Shop> {
  const { data: existing } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (existing) return existing as Shop;

  const { data, error } = await supabase
    .from('shops')
    .insert({
      owner_id: ownerId,
      name: "Mening do'konim",
      phone: phone ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Shop;
}
