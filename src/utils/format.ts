const MONTHS = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];

export function formatAmount(amount: number): string {
  const abs = Math.abs(amount)
    .toLocaleString('ru-RU')
    .replace(',', '.');
  const sign = amount < 0 ? '-' : '';
  return `${sign}${abs} so'm`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const isThisYear = d.getFullYear() === now.getFullYear();
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return isThisYear ? base : `${base} ${d.getFullYear()}`;
}
