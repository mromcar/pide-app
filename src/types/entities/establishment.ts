// Assuming User, Category, Product, ProductVariant, Order, EstablishmentAdministrator types will be defined elsewhere
// For now, we'll use placeholder types or omit them for brevity in this file.

export interface Establishment {
  establishmentId: number;
  name: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  // users: User[];
  // establishmentAdministrators: EstablishmentAdministrator[];
  // categories: Category[];
  // products: Product[];
  // productVariants: ProductVariant[];
  // orders: Order[];
}
