export function getCategoryImageUrl(categoryId: number): string {
  return `/images/categories/${categoryId}.jpg`
}

export function getProductImageUrl(productId: number): string {
  return `/images/products/${productId}.jpg`
}

// Función para verificar si existe una imagen
// Cache para evitar verificaciones repetidas
const imageExistenceCache = new Map<string, boolean>();

/**
 * Verifica si una imagen existe sin mostrar errores en consola
 */
export async function checkImageExists(url: string): Promise<boolean> {
  // Verificar caché primero
  if (imageExistenceCache.has(url)) {
    return imageExistenceCache.get(url)!;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const exists = response.ok;
    imageExistenceCache.set(url, exists);
    return exists;
  } catch {
    imageExistenceCache.set(url, false);
    return false;
  }
}

/**
 * Obtiene URL de imagen de categoría solo si existe
 */
export async function getCategoryImageUrlIfExists(categoryId: number): Promise<string | null> {
  const url = getCategoryImageUrl(categoryId);
  const exists = await checkImageExists(url);
  return exists ? url : null;
}

/**
 * Obtiene URL de imagen de producto solo si existe
 */
export async function getProductImageUrlIfExists(productId: number): Promise<string | null> {
  const url = getProductImageUrl(productId);
  const exists = await checkImageExists(url);
  return exists ? url : null;
}

/**
 * Construye la URL de imagen (no verifica existencia).
 */
export function getImageUrlWithFallback(basePath: string, id: number): string {
  const imageUrl = `${basePath}/${id}.jpg`
  return imageUrl
}
