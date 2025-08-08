import { CategoryTranslation } from './categoryTranslation';

export interface Category {
  categoryId: number;
  establishmentId: number;
  name: string;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  translations?: CategoryTranslation[];
  // products?: Product[];
}
