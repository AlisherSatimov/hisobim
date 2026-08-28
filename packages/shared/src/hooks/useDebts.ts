import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDebtsByCustomer, createDebt, deleteDebt } from '../services/debt.service';
import { CUSTOMER_KEY } from './useCustomers';
import { getOnline } from '../network';
import { enqueueDebt } from '../outbox';
import type { CreateDebtPayload, Debt } from '../types';

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
    // Offline bo'lsa yozuv navbatga tushadi — ekran kodi buni bilmaydi.
    mutationFn: async (payload: CreateDebtPayload): Promise<Debt | null> => {
      if (!getOnline()) {
        enqueueDebt(payload, createdBy);
        return null;
      }
      return createDebt(payload, createdBy);
    },
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
