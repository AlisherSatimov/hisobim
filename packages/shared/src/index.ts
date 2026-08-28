/**
 * @hisobim/shared — veb va mobil ilova ulashadigan yagona qatlam.
 *
 * Bu paket platformaga xos hech narsani import qilmaydi: saqlash va
 * Supabase client ilova ishga tushganda initHisobim() orqali ulanadi.
 */

// Init va client
export { initHisobim, getClient, supabase, type HisobimConfig } from './client';
export { setStorageAdapter, getStorageAdapter, type StorageAdapter } from './storage';
export { setOnline, getOnline, subscribeOnline } from './network';

// Offline navbat
export * from './outbox';
export * from './stores/outbox.store';

// Tiplar va yordamchilar
export * from './types';
export * from './validation';
export * from './format';

// Servis qatlami
export * from './services/auth.service';
export * from './services/customer.service';
export * from './services/debt.service';
export * from './services/reports.service';
export * from './services/shop.service';

// React Query hooklari
export * from './hooks/useCustomers';
export * from './hooks/useDebts';
export * from './hooks/useReports';

// Zustand store'lar
export * from './stores/auth.store';
export * from './stores/shop.store';
