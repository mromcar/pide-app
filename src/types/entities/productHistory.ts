import { Product } from './product';

export interface ProductHistory {
  id: number;
  productId?: number | null;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  updatedAt?: Date | null;

  // Relations
  product?: Product | null;
}
