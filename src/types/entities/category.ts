import { CategoryTranslation } from './categoryTranslation';

export interface Category {
  categoryId: number;
  establishmentId: number;
  name: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  translations?: CategoryTranslation[];
  // products?: Product[];
}
