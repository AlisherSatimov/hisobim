import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customer.service';
import { getOnline } from '../network';
import { enqueueCustomer } from '../outbox';
import type { CreateCustomerPayload, Customer, UpdateCustomerPayload } from '../types';

export const CUSTOMERS_KEY = (shopId: string) => ['customers', shopId] as const;
export const CUSTOMER_KEY  = (id: string)     => ['customer',  id]     as const;

export function useCustomers(shopId: string) {
  return useQuery({
    queryKey: CUSTOMERS_KEY(shopId),
    queryFn: () => fetchCustomers(shopId),
    enabled: !!shopId,
  });
}

export function useCustomerById(id: string, shopId?: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: CUSTOMER_KEY(id),
    queryFn: () => fetchCustomerById(id),
    enabled: !!id,
    staleTime: 30_000,
    placeholderData: () => {
      if (!shopId) return undefined;
      const list = queryClient.getQueryData<Customer[]>(CUSTOMERS_KEY(shopId));
      return list?.find(c => c.id === id);
    },
  });
}

/**
 * Offline bo'lsa yozuv navbatga tushadi — chaqiruvchi ekran buni bilmaydi,
 * shart shu yerda hal qilinadi.
 */
export function useCreateCustomer(shopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomerPayload): Promise<Customer | null> => {
      if (!getOnline()) {
        enqueueCustomer(payload);
        return null;
      }
      return createCustomer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY(shopId) });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateCustomer(shopId: string, customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCustomerPayload) => updateCustomer(customerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY(customerId) });
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY(shopId) });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteCustomer(shopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY(shopId) });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
