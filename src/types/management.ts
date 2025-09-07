// ✅ CREAR: src/types/management.ts
import type { LanguageCode } from '@/constants/languages'

import type { CategoryDTO } from '@/types/dtos/category'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'

export interface MenuManagementProps {
  establishmentId: string
  languageCode: LanguageCode
}

export interface CategoryManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
  onCategoriesChange: (categories: CategoryDTO[]) => void
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
}

export interface ProductManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
  allergens: AllergenResponseDTO[]
}

export interface VariantManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
}
