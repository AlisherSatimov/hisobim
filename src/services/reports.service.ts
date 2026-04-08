import { supabase } from '../lib/supabase';

export type ReportData = {
  totalDebt: number;
  customerCount: number;
  debtorCount: number;
  clearedCount: number;
  topDebtors: { id: string; name: string; phone: string | null; total_debt: number }[];
};

export async function fetchReports(shopId: string): Promise<ReportData> {
  const [customersRes, debtsRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, name, phone, total_debt')
      .eq('shop_id', shopId),
    supabase
      .from('debts')
      .select('amount')
      .eq('shop_id', shopId),
  ]);

  if (customersRes.error) throw customersRes.error;
  if (debtsRes.error) throw debtsRes.error;

  const customers = customersRes.data ?? [];
  const debts = debtsRes.data ?? [];

  const totalDebt = customers.reduce((sum, c) => sum + (c.total_debt ?? 0), 0);
  const topDebtors = [...customers]
    .filter(c => c.total_debt > 0)
    .sort((a, b) => b.total_debt - a.total_debt)
    .slice(0, 5);

  return {
    totalDebt,
    customerCount: customers.length,
    debtorCount: customers.filter(c => c.total_debt > 0).length,
    clearedCount: customers.filter(c => c.total_debt <= 0).length,
    topDebtors,
  };
}
