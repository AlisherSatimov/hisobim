import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageAdapter } from '../storage';
import type { CreateCustomerPayload, CreateDebtPayload } from '../types';

/**
 * Yuborilmagan yozuvlar navbati.
 *
 * Internetsiz paytda qo'shilgan mijoz va qarz/to'lov yozuvi shu yerga
 * tushadi. Navbat saqlanadi — ilova yopilib qayta ochilsa ham yo'qolmaydi.
 */

export type OutboxItem =
  | {
      id: string;
      kind: 'customer';
      payload: CreateCustomerPayload;
      createdAt: string;
      attempts: number;
      /** Server rad etgan — qayta urinilmaydi, foydalanuvchi ko'radi */
      failedReason?: string;
    }
  | {
      id: string;
      kind: 'debt';
      payload: CreateDebtPayload;
      createdBy: string;
      createdAt: string;
      attempts: number;
      failedReason?: string;
    };

type OutboxState = {
  items: OutboxItem[];
  add: (item: OutboxItem) => void;
  remove: (id: string) => void;
  markAttempt: (id: string) => void;
  markFailed: (id: string, reason: string) => void;
  clearFailed: () => void;
};

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((state) => ({ items: [...state.items, item] })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      markAttempt: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, attempts: i.attempts + 1 } : i
          ),
        })),
      markFailed: (id, reason) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, failedReason: reason } : i
          ),
        })),
      clearFailed: () =>
        set((state) => ({ items: state.items.filter((i) => !i.failedReason) })),
    }),
    {
      name: 'hisobim-outbox',
      storage: createJSONStorage(() => getStorageAdapter() as never),
    }
  )
);

/** Hali yuborilishi kutilayotgan (xatoga uchramagan) yozuvlar soni. */
export function pendingCount(items: OutboxItem[]): number {
  return items.filter((i) => !i.failedReason).length;
}
