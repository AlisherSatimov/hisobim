import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@hisobim/shared';
import { LoadingBox } from './States';

/**
 * Himoyalangan marshrutlar. Mantiq mobil tomondagi (auth)/_layout.tsx bilan
 * bir xil: sessiya tekshirilayotgan paytda ekran bo'sh qolmaydi, sessiya
 * yo'q bo'lsa login sahifasiga yo'naltiriladi.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingBox text="Tekshirilmoqda…" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
}

/** Sessiyasi bor foydalanuvchi login/register sahifalarida qolmasin. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuthStore();

  if (isLoading) return <LoadingBox text="Tekshirilmoqda…" />;
  if (session) return <Navigate to="/" replace />;

  return <>{children}</>;
}
