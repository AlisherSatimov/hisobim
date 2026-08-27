import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useShopStore,
  useCustomers,
  formatAmount,
  formatDate,
  type Customer,
} from '@hisobim/shared';
import { EmptyBox, ErrorBox, TableSkeleton } from '../components/States';
import CustomerFormModal from '../components/CustomerFormModal';

export default function Customers() {
  const activeShop = useShopStore((s) => s.activeShop);
  const shopId = activeShop?.id ?? '';
  const { data: customers = [], isLoading, isError, refetch } = useCustomers(shopId);

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q)
    );
  }, [customers, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Mijozlar</h1>
          <p className="subtitle">{customers.length} ta mijoz</p>
        </div>
        <button className="btn" onClick={openAdd}>
          Mijoz qo'shish
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Ism yoki telefon bo'yicha qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : isError ? (
        <ErrorBox text="Mijozlar ro'yxatini yuklab bo'lmadi." onRetry={() => refetch()} />
      ) : customers.length === 0 ? (
        <div className="card">
          <EmptyBox
            title="Mijozlar yo'q"
            text="Birinchi mijozni qo'shing — keyin unga qarz va to'lov yozuvlarini kiritasiz."
            actionLabel="Mijoz qo'shish"
            onAction={openAdd}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyBox
            title="Hech narsa topilmadi"
            text={`"${query}" bo'yicha mijoz yo'q. Boshqa ism yoki telefon raqamini kiriting.`}
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th className="num">Joriy qarz</th>
                <th>Qo'shilgan</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/customers/${c.id}`}>{c.name}</Link>
                  </td>
                  <td className="muted">{c.phone || '—'}</td>
                  <td className={`num ${c.total_debt > 0 ? 'amount-debt' : 'muted'}`}>
                    {formatAmount(c.total_debt)}
                  </td>
                  <td className="muted">{formatDate(c.created_at)}</td>
                  <td className="num">
                    <button className="btn secondary small" onClick={() => openEdit(c)}>
                      Tahrirlash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen ? (
        <CustomerFormModal
          shopId={shopId}
          customer={editing}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
    </div>
  );
}
