/**
 * Platformaga bog'liq saqlash qatlami.
 *
 * Mobil tomonda AsyncStorage, veb tomonda localStorage uzatiladi.
 * Shared kod hech qachon platformaga xos modulni import qilmaydi —
 * adapter ilova ishga tushganda bir marta ulanadi.
 */
export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

let adapter: StorageAdapter | null = null;

export function setStorageAdapter(value: StorageAdapter): void {
  adapter = value;
}

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    throw new Error(
      "Storage adapter ulanmagan. Ilova boshlanishida initHisobim() ni chaqiring."
    );
  }
  return adapter;
}
