import { describe, it, expect } from 'vitest';
import { formatAmount, formatDate } from '../format';

describe('formatAmount', () => {
  it('musbat summani so\'m bilan formatlaydi', () => {
    expect(formatAmount(50000)).toContain("so'm");
    expect(formatAmount(50000)).toContain('50');
  });

  it('manfiy summada minus belgisini saqlaydi', () => {
    expect(formatAmount(-50000).startsWith('-')).toBe(true);
  });

  it('nolni ham formatlaydi', () => {
    expect(formatAmount(0)).toBe("0 so'm");
  });
});

describe('formatDate', () => {
  it('joriy yil sanasida yilni ko\'rsatmaydi', () => {
    const now = new Date();
    const iso = new Date(now.getFullYear(), 2, 15).toISOString();
    expect(formatDate(iso)).not.toContain(String(now.getFullYear()));
  });

  it('o\'tgan yil sanasida yilni qo\'shadi', () => {
    const lastYear = new Date().getFullYear() - 1;
    const iso = new Date(lastYear, 2, 15).toISOString();
    expect(formatDate(iso)).toContain(String(lastYear));
  });
});
