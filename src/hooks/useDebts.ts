import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDebtsByCustomer, createDebt, deleteDebt } from '../services/debt.service';
import { CUSTOMER_KEY } from './useCustomers';
import type { CreateDebtPayload } from '../types';

export const DEBTS_KEY = (customerId: string) => ['debts', customerId] as const;

export function useDebts(customerId: string) {
  return useQuery({
    queryKey: DEBTS_KEY(customerId),
    queryFn: () => fetchDebtsByCustomer(customerId),
    enabled: !!customerId,
    staleTime: 30_000,
  });
}

export function useCreateDebt(customerId: string, createdBy: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTS_KEY(customerId) });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY(customerId) });
      // Bosh ro'yxatdagi total_debt va hisobotni yangilash
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteDebt(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTS_KEY(customerId) });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY(customerId) });
      // Bosh ro'yxatdagi total_debt va hisobotni yangilash
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
