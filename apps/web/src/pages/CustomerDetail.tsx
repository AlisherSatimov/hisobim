import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useShopStore,
  useCustomerById,
  useDebts,
  useDeleteDebt,
  formatAmount,
  formatDate,
} from '@hisobim/shared';
import { EmptyBox, ErrorBox, LoadingBox, TableSkeleton } from '../components/States';
import CustomerFormModal from '../components/CustomerFormModal';
import DebtFormModal from '../components/DebtFormModal';

export default function CustomerDetail() {
  const { id = '' } = useParams();
  const activeShop = useShopStore((s) => s.activeShop);
  const shopId = activeShop?.id ?? '';

  const customerQuery = useCustomerById(id, shopId);
  const debtsQuery = useDebts(id);
  const deleteDebt = useDeleteDebt(id);

  const [isEditOpen, setEditOpen] = useState(false);
  const [isDebtOpen, setDebtOpen] = useState(false);

  if (customerQuery.isLoading) return <LoadingBox text="Mijoz yuklanmoqda…" />;
  if (customerQuery.isError || !customerQuery.data) {
    return (
      <ErrorBox
        text="Mijoz ma'lumotini yuklab bo'lmadi."
        onRetry={() => customerQuery.refetch()}
      />
    );
  }

  const customer = customerQuery.data;
  const debts = debtsQuery.data ?? [];

  return (
    <div>
      <Link to="/customers" className="back-link">
        ← Mijozlar
      </Link>

      <div className="page-head">
        <div>
          <h1>{customer.name}</h1>
          <p className="subtitle">
            {customer.phone || 'Telefon kiritilmagan'}
            {customer.note ? ` · ${customer.note}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn secondary" onClick={() => setEditOpen(true)}>
            Tahrirlash
          </button>
          <button className="btn" onClick={() => setDebtOpen(true)}>
            Yozuv qo'shish
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 320 }}>
        <div className="stat-label">Joriy qarz</div>
        <div className={`stat-value ${customer.total_debt > 0 ? 'debt' : 'cleared'}`}>
          {formatAmount(customer.total_debt)}
        </div>
      </div>

      <h2>Yozuvlar tarixi</h2>

      {debtsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : debtsQuery.isError ? (
        <ErrorBox text="Yozuvlarni yuklab bo'lmadi." onRetry={() => debtsQuery.refetch()} />
      ) : debts.length === 0 ? (
        <div className="card">
          <EmptyBox
            title="Yozuv yo'q"
            text="Bu mijoz uchun hali qarz yoki to'lov yozilmagan."
            actionLabel="Yozuv qo'shish"
            onAction={() => setDebtOpen(true)}
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sana</th>
                <th>Izoh</th>
                <th className="num">Summa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => (
                <tr key={d.id}>
                  <td className="muted">{formatDate(d.created_at)}</td>
                  <td>{d.description || (d.amount < 0 ? "To'lov" : 'Qarz')}</td>
                  <td className={`num ${d.amount < 0 ? 'amount-paid' : 'amount-debt'}`}>
                    {formatAmount(d.amount)}
                  </td>
                  <td className="num">
                    <button
                      className="btn secondary small"
                      disabled={deleteDebt.isPending}
                      onClick={() => deleteDebt.mutate(d.id)}
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditOpen ? (
        <CustomerFormModal
          shopId={shopId}
          customer={customer}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {isDebtOpen ? (
        <DebtFormModal shopId={shopId} customerId={id} onClose={() => setDebtOpen(false)} />
      ) : null}
    </div>
  );
}
