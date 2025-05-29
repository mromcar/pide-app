// Assuming User, Category, Product, ProductVariant, Order, EstablishmentAdministrator types will be defined elsewhere
// For now, we'll use placeholder types or omit them for brevity in this file.

export interface Establishment {
  establishment_id: number;
  name: string;
  tax_id?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billing_bank_details?: string | null;
  payment_bank_details?: string | null;
  contact_person?: string | null;
  description?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  accepts_orders: boolean;
  created_at?: Date | null;
  updated_at?: Date | null;
  // users: User[];
  // establishment_administrators: EstablishmentAdministrator[];
  // categories: Category[];
  // products: Product[];
  // product_variants: ProductVariant[];
  // orders: Order[];
}