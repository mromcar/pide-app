import { Prisma, UserRole } from '@prisma/client';
import { Category } from './category';
import { Establishment } from './establishment';
import { ProductAllergen } from './productAllergen';
import { ProductHistory } from './productHistory';
import { ProductTranslation } from './productTranslation';
import { ProductVariant } from './productVariant';
import { User } from './user';

export interface Product {
  product_id: number;
  establishment_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  responsible_role?: UserRole | null;
  created_by_user_id?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  // Relations
  establishment?: Establishment;
  category?: Category;
  creator?: User | null;
  translations?: ProductTranslation[];
  history?: ProductHistory[];
  variants?: ProductVariant[];
  allergens?: ProductAllergen[];
}