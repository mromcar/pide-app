import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductResponseDTO,
  ProductWithRelationsResponseDTO,
} from '@/types/dtos/product'
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'
import { ProductApiError } from '@/types/errors/product.api.error'
import { getClientApiUrl, debugApiClient } from '@/lib/api-client'

const API_MENU_PATH = '/api/menu'
const API_ADMIN_PATH = '/api/admin/establishments'

// Public
export async function getAllProductsByEstablishment(establishmentId: number, categoryId?: number): Promise<ProductResponseDTO[]> {
  try {
    console.log('🔍 ProductAPI: Fetching products for establishment:', establishmentId, { categoryId })

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    let apiPath = `${API_MENU_PATH}/${establishmentId}/products`
    const q = new URLSearchParams()
    if (categoryId) q.set('categoryId', String(categoryId))
    if (q.toString()) apiPath += `?${q.toString()}`
    const apiUrl = getClientApiUrl(apiPath)

    const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } })

    const result = await handleApiResponse<ProductResponseDTO[]>(response)

    console.log('✅ ProductAPI: Products loaded:', result.length)
    return result
  } catch (error) {
    console.error('❌ ProductAPI: Error fetching products:', error)
    throw handleCaughtError(error, ProductApiError, 'Failed to fetch products')
  }
}

export async function getProductById(establishmentId: number, productId: number): Promise<ProductWithRelationsResponseDTO | null> {
  try {
    console.log('🔍 ProductAPI: Fetching product by ID:', { establishmentId, productId })

    const products = await getAllProductsByEstablishment(establishmentId)
    const product = products.find((p) => p.productId === productId)

    if (!product) {
      console.log('⚠️ ProductAPI: Product not found:', productId)
      return null
    }

    console.log('✅ ProductAPI: Product loaded:', product.name)
    return product as ProductWithRelationsResponseDTO
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    console.error('❌ ProductAPI: Error fetching product:', error)
    throw handleCaughtError(error, ProductApiError, 'Failed to fetch product')
  }
}

// Admin CRUD (simple)
export async function createProduct(establishmentId: number, productData: ProductCreateDTO): Promise<ProductResponseDTO> {
  try {
    console.log('🔍 ProductAPI: Creating product for establishment:', establishmentId, productData.name)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products`)

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData), credentials: 'include' })

    const result = await handleApiResponse<ProductResponseDTO>(response)

    console.log('✅ ProductAPI: Product created:', result.productId)
    return result
  } catch (error) {
    console.error('❌ ProductAPI: Error creating product:', error)
    throw handleCaughtError(error, ProductApiError, 'Failed to create product')
  }
}

export async function updateProduct(establishmentId: number, productId: number, productData: ProductUpdateDTO): Promise<ProductResponseDTO> {
  try {
    console.log('🔍 ProductAPI: Updating product:', { establishmentId, productId, productData })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products/${productId}`)

    const response = await fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData), credentials: 'include' })

    const result = await handleApiResponse<ProductResponseDTO>(response)

    console.log('✅ ProductAPI: Product updated:', result.productId)
    return result
  } catch (error) {
    console.error('❌ ProductAPI: Error updating product:', error)
    throw handleCaughtError(error, ProductApiError, 'Failed to update product')
  }
}

export async function deleteProduct(establishmentId: number, productId: number): Promise<void> {
  try {
    console.log('🔍 ProductAPI: Deleting product:', { establishmentId, productId })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products/${productId}`)

    const response = await fetch(apiUrl, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })

    await handleApiResponse<void>(response)

    console.log('✅ ProductAPI: Product deleted:', productId)
  } catch (error) {
    console.error('❌ ProductAPI: Error deleting product:', error)
    throw handleCaughtError(error, ProductApiError, 'Failed to delete product')
  }
}

// Admin (list/create/update/delete used by AdminMenuManager)
type ProductsResponse = { products: ProductResponseDTO[] }
type ProductOneResponse = { product: ProductResponseDTO }

export async function getAdminProducts(establishmentId: number, opts?: { categoryId?: number }): Promise<ProductResponseDTO[]> {
  const q = new URLSearchParams()
  if (opts?.categoryId) q.set('categoryId', String(opts.categoryId))
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products?${q}`), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch products')
  const json: ProductsResponse = await res.json()
  return json.products
}

export async function createAdminProduct(establishmentId: number, body: unknown): Promise<ProductResponseDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products`), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create product')
  const json: ProductOneResponse = await res.json()
  return json.product
}

export async function updateAdminProduct(establishmentId: number, id: number, body: unknown): Promise<ProductResponseDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products/${id}`), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update product')
  const json: ProductOneResponse = await res.json()
  return json.product
}

export async function deleteAdminProduct(establishmentId: number, id: number): Promise<void> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/products/${id}`), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}
