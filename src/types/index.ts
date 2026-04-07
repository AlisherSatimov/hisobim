export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  region: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  note: string | null;
  total_debt: number;
  created_at: string;
};

export type Debt = {
  id: string;
  shop_id: string;
  customer_id: string;
  amount: number;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type UserRole = 'owner' | 'cashier' | 'viewer';

export type CreateCustomerPayload = {
  shop_id: string;
  name: string;
  phone?: string | null;
  note?: string | null;
};

export type UpdateCustomerPayload = {
  name: string;
  phone?: string | null;
  note?: string | null;
};

export type CreateDebtPayload = {
  shop_id: string;
  customer_id: string;
  amount: number;
  description: string | null;
};
