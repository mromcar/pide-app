import { Prisma, UserRole } from '@prisma/client';
import { Category } from './category';
import { Establishment } from './establishment';
import { ProductAllergen } from './productAllergen';
import { ProductHistory } from './productHistory';
import { ProductTranslation } from './productTranslation';
import { ProductVariant } from './productVariant';
import { User } from './user';

export interface Product {
  productId: number;
  establishmentId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  responsibleRole?: UserRole | null;
  createdByUserId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  // Relations
  establishment?: Establishment;
  category?: Category;
  creator?: User | null;
  translations?: ProductTranslation[];
  history?: ProductHistory[];
  variants?: ProductVariant[];
  allergens?: ProductAllergen[];
}
