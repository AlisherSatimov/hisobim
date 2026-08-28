import { describe, it, expect, beforeEach, vi } from 'vitest';

// Servislar mock qilinadi — haqiqiy bazaga chiqilmaydi.
vi.mock('../services/customer.service', () => ({
  createCustomer: vi.fn(),
  fetchCustomers: vi.fn(),
  fetchCustomerById: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));
vi.mock('../services/debt.service', () => ({
  createDebt: vi.fn(),
  fetchDebtsByCustomer: vi.fn(),
  deleteDebt: vi.fn(),
}));

import { setStorageAdapter } from '../storage';
import { setOnline } from '../network';
import { createCustomer } from '../services/customer.service';
import { enqueueCustomer, flushOutbox } from '../outbox';
import { useOutboxStore } from '../stores/outbox.store';

// Xotiradagi oddiy saqlash adapteri (zustand persist uchun).
const memory = new Map<string, string>();
setStorageAdapter({
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  },
});

const payload = { shop_id: 'shop-1', name: 'Aziz' };

describe('outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOutboxStore.setState({ items: [] });
    setOnline(true);
  });

  it('offline paytda qo\'shilgan yozuv navbatda turadi', () => {
    enqueueCustomer(payload);
    expect(useOutboxStore.getState().items).toHaveLength(1);
  });

  it('aloqa bor bo\'lsa navbatni yuboradi va bo\'shatadi', async () => {
    vi.mocked(createCustomer).mockResolvedValue({ id: 'c1' } as never);
    enqueueCustomer(payload);

    await flushOutbox();

    expect(createCustomer).toHaveBeenCalledOnce();
    expect(useOutboxStore.getState().items).toHaveLength(0);
  });

  it('tarmoq xatosida element navbatda qoladi — keyin qayta urinamiz', async () => {
    vi.mocked(createCustomer).mockRejectedValue(new Error('Network request failed'));
    enqueueCustomer(payload);

    await flushOutbox();

    const items = useOutboxStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].failedReason).toBeUndefined();
  });

  it('server rad etsa (Postgres kodi bor) element xato holatiga o\'tadi', async () => {
    // 42501 — RLS rad etdi. Qayta urinishning ma'nosi yo'q, aks holda
    // navbat cheksiz aylanadi.
    vi.mocked(createCustomer).mockRejectedValue(
      Object.assign(new Error('new row violates row-level security policy'), {
        code: '42501',
      })
    );
    enqueueCustomer(payload);

    await flushOutbox();

    const items = useOutboxStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].failedReason).toBeTruthy();
  });

  it('xato holatidagi element qayta yuborilmaydi', async () => {
    vi.mocked(createCustomer).mockRejectedValue(
      Object.assign(new Error('rad etildi'), { code: '23505' })
    );
    enqueueCustomer(payload);
    await flushOutbox();

    vi.clearAllMocks();
    await flushOutbox();

    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('offline bo\'lsa umuman yubormaydi', async () => {
    setOnline(false);
    enqueueCustomer(payload);

    await flushOutbox();

    expect(createCustomer).not.toHaveBeenCalled();
    expect(useOutboxStore.getState().items).toHaveLength(1);
  });
});
