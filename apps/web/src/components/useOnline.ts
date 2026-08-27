import { useEffect, useState } from 'react';

/**
 * Tarmoq holati. `navigator.onLine` boshlang'ich qiymatni beradi,
 * keyingi o'zgarishlar `online` / `offline` hodisalari orqali keladi.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
