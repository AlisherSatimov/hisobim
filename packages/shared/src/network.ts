/**
 * Tarmoq holati — platformaga bog'liq emas.
 *
 * Shared kod hech qachon netinfo yoki `navigator.onLine` ni bilmaydi:
 * mobil tomonda netinfo, veb tomonda `online`/`offline` hodisalari holatni
 * shu yerga uzatadi (storage adapteri bilan bir xil yondashuv).
 */

type Listener = (online: boolean) => void;

let online = true;
const listeners = new Set<Listener>();

export function setOnline(value: boolean): void {
  if (online === value) return;
  online = value;
  for (const listener of listeners) listener(value);
}

export function getOnline(): boolean {
  return online;
}

export function subscribeOnline(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
