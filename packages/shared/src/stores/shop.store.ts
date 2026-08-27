import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageAdapter } from '../storage';
import type { Shop } from '../types';

type ShopState = {
  activeShop: Shop | null;
  setShop: (shop: Shop | null) => void;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      activeShop: null,
      setShop: (shop) => set({ activeShop: shop }),
    }),
    {
      name: 'hisobim-shop',
      storage: createJSONStorage(() => getStorageAdapter() as never),
    }
  )
);
