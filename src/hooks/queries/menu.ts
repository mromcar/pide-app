'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/services/queryKeys'
import {
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
} from '@/services/api/category.api'
import {
  getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct,
} from '@/services/api/product.api'
import {
  getAdminVariants, createAdminVariant, updateAdminVariant, deleteAdminVariant,
} from '@/services/api/variant.api'
import { getAdminAllergens } from '@/services/api/allergen.api'
import {
  mapCategoryDTOToUI, mapProductDTOToUI, mapVariantDTOToUI,
  mapProductUIToDTO, mapVariantUIToDTO, mapDTOCategoryTranslationsToUI
} from '@/services/mappers/menuMappers'
import type { MenuCategory, MenuProduct, ProductVariant, UIAllergen } from '@/types/management/menu'
import type { CategoryCreateDTO, CategoryUpdateDTO } from '@/types/dtos/category'

export function useAllergens(establishmentId: number) {
  return useQuery({
    queryKey: qk.allergens(establishmentId),
    queryFn: async () => {
      const allgs = await getAdminAllergens(establishmentId)
      return allgs.map(
        (a: { allergenId?: number; id?: number; name?: string; allergenName?: string }): UIAllergen => ({
          id: a.allergenId ?? a.id ?? 0,
          name: a.name ?? a.allergenName ?? '',
        })
      )
    },
    staleTime: 5 * 60_000,
  })
}

export function useCategories(establishmentId: number) {
  const qc = useQueryClient()

  const categoriesQ = useQuery({
    queryKey: qk.categories(establishmentId),
    queryFn: async () => (await getAdminCategories(establishmentId)).map(mapCategoryDTOToUI),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  // CREATE: Acepta CategoryCreateDTO directamente
  const createM = useMutation({
    mutationFn: (data: CategoryCreateDTO) => {
      console.log('[useCategories] createM - Using consistent DTO format:', data)
      console.log('[useCategories] createM - translations:', data.translations, 'isArray:', Array.isArray(data.translations))
      return createAdminCategory(establishmentId, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories(establishmentId) }),
  })

  // ✅ CORREGIDO: UPDATE acepta CategoryUpdateDTO directamente
  const updateM = useMutation({
    mutationFn: (data: CategoryUpdateDTO & { id: number }) => {
      console.log('[useCategories] updateM - CategoryUpdateDTO:', data)

      const { id, ...updateData } = data

      // ✅ NO hacer conversión manual - updateData ya está en formato DTO correcto
      console.log('[useCategories] updateM - Sending to API:', updateData)
      console.log('[useCategories] updateM - translations type:', typeof updateData.translations, 'isArray:', Array.isArray(updateData.translations))

      return updateAdminCategory(establishmentId, id, updateData)
    },
    onMutate: async (v) => {
      const key = qk.categories(establishmentId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MenuCategory[]>(key)

      if (prev && 'id' in v) {
        // ✅ CORREGIDO: Optimistic update con type safety garantizada
        const updatedCategories = prev.map((c): MenuCategory => {
          if (c.id !== v.id) return c

          // ✅ Garantizar tipos no-null con fallbacks seguros
          const newOrder: number = v.sortOrder !== undefined && v.sortOrder !== null ? v.sortOrder : c.order
          const newActive: boolean = v.isActive !== undefined && v.isActive !== null ? v.isActive : c.active

          // ✅ Translations conversion con type safety
          let newTranslations = c.translations
          if (v.translations && Array.isArray(v.translations)) {
            // ✅ Filtrar translations válidas antes de mapear
            const validTranslations = v.translations.filter(
              (t): t is { languageCode: string; name: string } =>
                typeof t.languageCode === 'string' && typeof t.name === 'string'
            )
            if (validTranslations.length > 0) {
              newTranslations = mapDTOCategoryTranslationsToUI(validTranslations)
            }
          }

          return {
            ...c,
            active: newActive,    // ✅ Guaranteed boolean
            order: newOrder,      // ✅ Guaranteed number
            translations: newTranslations
          }
        })

        qc.setQueryData<MenuCategory[]>(key, updatedCategories)
      }
      return { prev, key }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.categories(establishmentId) }),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(establishmentId, id),
    onMutate: async (id) => {
      const key = qk.categories(establishmentId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MenuCategory[]>(key)
      if (prev) qc.setQueryData<MenuCategory[]>(key, prev.filter((c) => c.id !== id))
      return { prev, key }
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.categories(establishmentId) }),
  })

  return { categoriesQ, createM, updateM, deleteM }
}

export function useProducts(establishmentId: number, categoryId?: number | null) {
  const qc = useQueryClient()
  const productsQ = useQuery({
    enabled: !!categoryId,
    queryKey: qk.products(establishmentId, categoryId ?? -1),
    queryFn: async () =>
      (await getAdminProducts(establishmentId, { categoryId: categoryId! })).map(mapProductDTOToUI),
  })
  const createM = useMutation({
    mutationFn: (v: MenuProduct) => createAdminProduct(establishmentId, mapProductUIToDTO(v)),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: qk.products(establishmentId, v.categoryId) }),
  })
  const updateM = useMutation({
    mutationFn: (v: MenuProduct) => updateAdminProduct(establishmentId, v.id, mapProductUIToDTO(v)),
    onMutate: async (v) => {
      const key = qk.products(establishmentId, v.categoryId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MenuProduct[]>(key)
      if (prev) qc.setQueryData<MenuProduct[]>(key, prev.map((p) => (p.id === v.id ? { ...p, ...v } : p)))
      return { prev, key }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: (_d, _e, v) => qc.invalidateQueries({ queryKey: qk.products(establishmentId, v.categoryId) }),
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => deleteAdminProduct(establishmentId, id),
    onMutate: async (id) => {
      const key = qk.products(establishmentId, categoryId ?? -1)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MenuProduct[]>(key)
      if (prev) qc.setQueryData<MenuProduct[]>(key, prev.filter((p) => p.id !== id))
      return { prev, key }
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.products(establishmentId, categoryId ?? -1) }),
  })
  return { productsQ, createM, updateM, deleteM }
}

export function useVariants(establishmentId: number, productId?: number | null) {
  const qc = useQueryClient()
  const variantsQ = useQuery({
    enabled: !!productId,
    queryKey: qk.variants(establishmentId, productId ?? -1),
    queryFn: async () => (await getAdminVariants(establishmentId, productId!)).map(mapVariantDTOToUI),
  })
  const createM = useMutation({
    mutationFn: (v: ProductVariant) => createAdminVariant(establishmentId, mapVariantUIToDTO(v)),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: qk.variants(establishmentId, v.productId) }),
  })
  const updateM = useMutation({
    mutationFn: (v: ProductVariant) => updateAdminVariant(establishmentId, v.id, mapVariantUIToDTO(v)),
    onMutate: async (v) => {
      const key = qk.variants(establishmentId, v.productId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ProductVariant[]>(key)
      if (prev) qc.setQueryData<ProductVariant[]>(key, prev.map((x) => (x.id === v.id ? { ...x, ...v } : x)))
      return { prev, key }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: (_d, _e, v) => qc.invalidateQueries({ queryKey: qk.variants(establishmentId, v.productId) }),
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => deleteAdminVariant(establishmentId, id),
    onMutate: async (id) => {
      const key = qk.variants(establishmentId, productId ?? -1)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ProductVariant[]>(key)
      if (prev) qc.setQueryData<ProductVariant[]>(key, prev.filter((v) => v.id !== id))
      return { prev, key }
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.variants(establishmentId, productId ?? -1) }),
  })
  return { variantsQ, createM, updateM, deleteM }
}
