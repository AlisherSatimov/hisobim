import { supabase } from '../lib/supabase';
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from '../types';

export async function fetchCustomers(shopId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Customer[];
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function searchCustomers(shopId: string, query: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(50);
  if (error) throw error;
  return data as Customer[];
}
