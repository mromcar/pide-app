import { Product } from './product';

export interface ProductHistory {
  id: number;
  product_id?: number | null;
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  updated_at?: Date | null;

  // Relations
  product?: Product | null;
}