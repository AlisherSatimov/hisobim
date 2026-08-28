import type { QueryClient } from '@tanstack/react-query';
import { createCustomer } from './services/customer.service';
import { createDebt } from './services/debt.service';
import { useOutboxStore, type OutboxItem } from './stores/outbox.store';
import { getOnline, subscribeOnline } from './network';
import type { CreateCustomerPayload, CreateDebtPayload } from './types';

/**
 * Offline navbatni yuborish mantig'i.
 *
 * Ekran kodi bu yerni bilmaydi — hooklar (useCreateCustomer / useCreateDebt)
 * offline bo'lsa yozuvni shu navbatga qo'yadi, aloqa qaytganda flushOutbox()
 * uni yuboradi.
 */

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function enqueueCustomer(payload: CreateCustomerPayload): void {
  useOutboxStore.getState().add({
    id: newId(),
    kind: 'customer',
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
}

export function enqueueDebt(payload: CreateDebtPayload, createdBy: string): void {
  useOutboxStore.getState().add({
    id: newId(),
    kind: 'debt',
    payload,
    createdBy,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
}

/**
 * Xatoni ikkiga ajratadi.
 *
 * Tarmoq xatosi — vaqtinchalik, element navbatda qoladi va keyin qayta
 * urinilаdi. Server rad etgani (RLS, validatsiya, cheklov) — qayta
 * urinishning ma'nosi yo'q, aks holda navbat cheksiz aylanadi.
 */
function isNetworkError(err: unknown): boolean {
  // Supabase PostgrestError'da `code` bo'ladi (42501 — RLS, 23505 — takror
  // va h.k.). Kod bor = so'rov serverga yetib borgan va rad etilgan,
  // demak qayta urinish bekor.
  if (err && typeof err === 'object' && 'code' in err && (err as { code: unknown }).code) {
    return false;
  }

  // Kodsiz xato odatda fetch darajasidagi uzilish.
  const message = err instanceof Error ? err.message.toLowerCase() : '';
  return (
    message === '' ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  );
}

async function sendItem(item: OutboxItem): Promise<void> {
  if (item.kind === 'customer') {
    await createCustomer(item.payload);
  } else {
    await createDebt(item.payload, item.createdBy);
  }
}

let isFlushing = false;

/**
 * Navbatni tartib bilan yuboradi. Bir vaqtda faqat bitta yuborish ishlaydi
 * (aloqa bir necha marta uzilib-ulansa takror yuborilmasin).
 */
export async function flushOutbox(queryClient?: QueryClient): Promise<void> {
  if (isFlushing || !getOnline()) return;

  const store = useOutboxStore.getState();
  const queue = store.items.filter((i) => !i.failedReason);
  if (queue.length === 0) return;

  isFlushing = true;
  let sentAny = false;

  try {
    for (const item of queue) {
      if (!getOnline()) break;

      useOutboxStore.getState().markAttempt(item.id);
      try {
        await sendItem(item);
        useOutboxStore.getState().remove(item.id);
        sentAny = true;
      } catch (err) {
        if (isNetworkError(err)) {
          // Aloqa yana uzildi — qolganini keyingi safar yuboramiz.
          break;
        }
        const reason = err instanceof Error ? err.message : "Server rad etdi";
        useOutboxStore.getState().markFailed(item.id, reason);
      }
    }
  } finally {
    isFlushing = false;
  }

  if (sentAny && queryClient) {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  }
}

/**
 * Aloqa qaytganda navbatni avtomatik yuborish. Ilova ishga tushganda bir
 * marta chaqiriladi, obunani bekor qiluvchi funksiya qaytaradi.
 */
export function startOutboxSync(queryClient: QueryClient): () => void {
  void flushOutbox(queryClient);

  return subscribeOnline((online) => {
    if (online) void flushOutbox(queryClient);
  });
}
