export const qk = {
  categories: (establishmentId: number | string) =>
    ['establishment', String(establishmentId), 'categories'] as const,
  allergens: (establishmentId: number | string) =>
    ['establishment', String(establishmentId), 'allergens'] as const,
  products: (establishmentId: number | string, categoryId: number | string) =>
    ['establishment', String(establishmentId), 'products', Number(categoryId)] as const,
  variants: (establishmentId: number | string, productId: number | string) =>
    ['establishment', String(establishmentId), 'variants', Number(productId)] as const
} as const
