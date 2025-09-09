import type { MenuCategory, MenuProduct, ProductVariant } from '@/types/management/menu'

// Tipos Admin (categorías con productos y variantes anidadas)
export type AdminMenuVariant = ProductVariant
export type AdminMenuProduct = MenuProduct & { variants: AdminMenuVariant[] }
export type AdminMenuCategory = MenuCategory & { products: AdminMenuProduct[] }

export async function getAdminMenu(establishmentId: number): Promise<{ categories: AdminMenuCategory[] }> {
  const res = await fetch(`/api/admin/establishments/${establishmentId}/menu`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Failed to load admin menu: ${res.status} ${msg}`)
  }
  // La API ya devuelve el DTO normalizado para UI
  return res.json()
}
