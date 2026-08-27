import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore, useShopStore, fetchOrCreateShop, signOut } from '@hisobim/shared';
import { useOnline } from './useOnline';
import { LoadingBox } from './States';

/**
 * Ilova qobig'i: yon panel + tarkib. Do'kon shu yerda bir marta yuklanadi,
 * chunki barcha ichki sahifalar `activeShop.id` ga tayanadi (mobil tomonda
 * bu ish (tabs)/index.tsx da qilinadi).
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { activeShop, setShop } = useShopStore();
  const online = useOnline();

  useEffect(() => {
    if (!user || activeShop) return;
    fetchOrCreateShop(user.id).then(setShop);
  }, [user, activeShop, setShop]);

  const onSignOut = async () => {
    await signOut();
    setShop(null);
    navigate('/login', { replace: true });
  };

  return (
    <div>
      {!online ? (
        <div className="offline-banner">
          Internet aloqasi yo'q — ma'lumot yangilanmayapti
        </div>
      ) : null}

      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">Hisobim</div>
            <div className="sidebar-shop">{activeShop?.name ?? '…'}</div>
          </div>

          <nav>
            <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              Hisobot
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              Mijozlar
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">{user?.email}</div>
            <button className="btn secondary small" onClick={onSignOut}>
              Chiqish
            </button>
          </div>
        </aside>

        <main className="content">
          {activeShop ? <Outlet /> : <LoadingBox text="Do'kon yuklanmoqda…" />}
        </main>
      </div>
    </div>
  );
}
