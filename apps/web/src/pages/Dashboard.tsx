import { Link } from 'react-router-dom';
import { useShopStore, useReports, formatAmount } from '@hisobim/shared';
import { EmptyBox, ErrorBox, TableSkeleton } from '../components/States';

export default function Dashboard() {
  const activeShop = useShopStore((s) => s.activeShop);
  const shopId = activeShop?.id ?? '';
  const { data, isLoading, isError, refetch } = useReports(shopId);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Hisobot</h1>
          <p className="subtitle">{activeShop?.name}</p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : isError ? (
        <ErrorBox text="Hisobotni yuklab bo'lmadi." onRetry={() => refetch()} />
      ) : data ? (
        <>
          <div className="stat-grid">
            <div className="card">
              <div className="stat-label">Umumiy qarz</div>
              <div className="stat-value debt">{formatAmount(data.totalDebt)}</div>
            </div>
            <div className="card">
              <div className="stat-label">Mijozlar</div>
              <div className="stat-value">{data.customerCount}</div>
            </div>
            <div className="card">
              <div className="stat-label">Qarzdorlar</div>
              <div className="stat-value">{data.debtorCount}</div>
            </div>
            <div className="card">
              <div className="stat-label">Qarzi yopilganlar</div>
              <div className="stat-value cleared">{data.clearedCount}</div>
            </div>
          </div>

          <h2>Eng katta qarzdorlar</h2>
          {data.topDebtors.length === 0 ? (
            <div className="card">
              <EmptyBox
                title="Qarzdor yo'q"
                text="Hozircha hech kimda qarz qolmagan. Yangi yozuvlar shu yerda ko'rinadi."
              />
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mijoz</th>
                    <th>Telefon</th>
                    <th className="num">Qarz</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDebtors.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`}>{c.name}</Link>
                      </td>
                      <td className="muted">{c.phone || '—'}</td>
                      <td className="num amount-debt">{formatAmount(c.total_debt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
