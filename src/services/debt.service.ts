import { supabase } from '../lib/supabase';
import type { Debt, CreateDebtPayload } from '../types';

export async function fetchDebtsByCustomer(customerId: string): Promise<Debt[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Debt[];
}

export async function createDebt(payload: CreateDebtPayload, createdBy: string): Promise<Debt> {
  const { data, error } = await supabase
    .from('debts')
    .insert({ ...payload, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data as Debt;
}

export async function deleteDebt(id: string): Promise<void> {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
