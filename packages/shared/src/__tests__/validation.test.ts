import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  signUpSchema,
  addCustomerSchema,
  addDebtSchema,
} from '../validation';

describe('loginSchema', () => {
  it('to\'g\'ri email va parolni qabul qiladi', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123456' }).success).toBe(true);
  });

  it('noto\'g\'ri email formatini rad etadi', () => {
    expect(loginSchema.safeParse({ email: 'abc', password: '123456' }).success).toBe(false);
  });

  it('6 belgidan qisqa parolni rad etadi', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '12345' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  const valid = {
    shopName: 'Baraka',
    email: 'a@b.com',
    password: 'parol123',
    confirmPassword: 'parol123',
  };

  it('to\'liq va to\'g\'ri formani qabul qiladi', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('parollar mos kelmasa rad etadi va xatoni confirmPassword ga bog\'laydi', () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: 'boshqa123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('juda qisqa do\'kon nomini rad etadi', () => {
    expect(signUpSchema.safeParse({ ...valid, shopName: 'A' }).success).toBe(false);
  });
});

describe('addCustomerSchema', () => {
  it('faqat ism bilan ishlaydi — telefon va izoh ixtiyoriy', () => {
    expect(addCustomerSchema.safeParse({ name: 'Aziz' }).success).toBe(true);
  });

  it('bo\'sh telefonni qabul qiladi', () => {
    expect(addCustomerSchema.safeParse({ name: 'Aziz', phone: '' }).success).toBe(true);
  });

  it('harfli telefon raqamini rad etadi', () => {
    expect(addCustomerSchema.safeParse({ name: 'Aziz', phone: 'telefon' }).success).toBe(false);
  });
});

describe('addDebtSchema', () => {
  it('musbat summani qabul qiladi', () => {
    expect(addDebtSchema.safeParse({ amount: '50000' }).success).toBe(true);
  });

  it('nol va manfiy summani rad etadi', () => {
    expect(addDebtSchema.safeParse({ amount: '0' }).success).toBe(false);
    expect(addDebtSchema.safeParse({ amount: '-100' }).success).toBe(false);
  });

  it('raqam bo\'lmagan qiymatni rad etadi', () => {
    expect(addDebtSchema.safeParse({ amount: 'ellik ming' }).success).toBe(false);
  });
});
