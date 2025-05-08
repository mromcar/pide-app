import type { DBCategory, Category } from '@/types/menu'

export function serializeCategories(categories: DBCategory[]): Category[] {
  return categories.map((cat) => ({
    category_id: cat.category_id,
    establishment_id: cat.establishment_id,
    name: cat.name,
    image_url: cat.image_url,
    sort_order: cat.sort_order ?? 0,
    is_active: cat.is_active ?? true,
    translations: cat.CategoryTranslation ?? [],
    products: cat.products.map((prod) => ({
      // ...existing serialization
    }))
  }))
}
