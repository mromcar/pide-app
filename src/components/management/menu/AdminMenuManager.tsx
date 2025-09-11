'use client'
import '@/styles/components/admin-menu.css'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import CategoryList from './CategoryList'
import ProductTable from './ProductTable'
import EditDrawer from './drawers/EditDrawer'
import CategoryForm from './forms/CategoryForm'
import ProductForm from './forms/ProductForm'
import VariantForm from './forms/VariantForm'
import { notify } from '@/utils/notify'
import {
  mapCategoryUIToCreateDTO,
  mapCategoryUIToUpdateDTO,
  mapCategoryPartialToUpdateDTO,
} from '@/services/mappers/menuMappers'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminMenu,
  type AdminMenuCategory,
  type AdminMenuProduct,
} from '@/services/api/menu.api'
import { useAllergens, useCategories, useProducts, useVariants } from '@/hooks/queries/menu'
import { VISIBLE_LANGS, type LanguageCode } from '@/constants/languages'
import type {
  DrawerEntity,
  MenuCategory,
  MenuProduct,
  ProductVariant,
} from '@/types/management/menu'
import type { CategoryUpdateDTO } from '@/types/dtos/category'

interface Props {
  establishmentId: string
  lang: LanguageCode
}

export default function AdminMenuManager({ establishmentId, lang }: Props) {
  const { t } = useTranslation(lang)
  const estId = Number(establishmentId)
  const qc = useQueryClient()

  // Estado local
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null)
  const drawerOpen = !!drawer
  const openDrawer = (entity: DrawerEntity) => setDrawer(entity)
  const closeDrawer = () => setDrawer(null)

  // Menú agregado - Following TanStack Query patterns
  const adminMenuQ = useQuery({
    queryKey: ['adminMenu', estId],
    queryFn: () => getAdminMenu(estId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  // Mutaciones - Following TanStack Query hook patterns
  const {
    createM: createCategoryM,
    updateM: updateCategoryM,
    deleteM: deleteCategoryM,
  } = useCategories(estId)

  const allergensQ = useAllergens(estId)

  const {
    createM: createProductM,
    updateM: updateProductM,
    deleteM: deleteProductM,
  } = useProducts(estId, selectedCategoryId)

  const { createM: createVariantM, updateM: updateVariantM } = useVariants(estId, selectedProductId)

  const allergens = allergensQ.data ?? []
  const categories: AdminMenuCategory[] = adminMenuQ.data?.categories ?? []
  const products: AdminMenuProduct[] =
    (selectedCategoryId != null
      ? categories.find((c) => c.id === selectedCategoryId)?.products
      : categories[0]?.products) ?? []

  // Auto-selecciones
  useEffect(() => {
    if (categories.length && selectedCategoryId == null) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  useEffect(() => {
    if (!products.length) setSelectedProductId(null)
    else if (selectedProductId == null) setSelectedProductId(products[0].id)
  }, [products, selectedProductId])

  const loading = adminMenuQ.isLoading || allergensQ.isLoading

  async function invalidateMenu() {
    await qc.invalidateQueries({ queryKey: ['adminMenu', estId] })
  }

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-body">
          <div className="loading-content">
            <div className="loading-spinner" />
            <p className="sr-only">{t.establishmentAdmin.forms.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-menu__grid">
      <aside className="admin-menu__sidebar">
        <CategoryList
          lang={lang}
          categories={categories as any}
          onSelect={(id) => {
            setSelectedCategoryId(id)
            setSelectedProductId(null)
          }}
          onCreate={async (draft) => {
            openDrawer({
              type: 'category',
              mode: 'create',
              context: { orderHint: (draft as any).order },
            })
          }}
          onDelete={async (id) => {
            try {
              await deleteCategoryM.mutateAsync(id)
              await invalidateMenu()
              if (selectedCategoryId === id) {
                setSelectedCategoryId(null)
                setSelectedProductId(null)
              }
              notify.success(t.establishmentAdmin.notifications?.categoryDeleted ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.categoryDeleteError ?? '✖')
            }
          }}
          onUpdate={async (id, updateDTO: CategoryUpdateDTO) => {
            // ✅ updateDTO ya viene mapeado desde CategoryList
            try {
              await updateCategoryM.mutateAsync({ id, ...updateDTO })
              await invalidateMenu()
              notify.success(t.establishmentAdmin.notifications?.categoryUpdated ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.categoryUpdateError ?? '✖')
            }
          }}
          onReorder={async (nextOrders) => {
            try {
              // ✅ Procesar reordenamientos con mappers
              for (const { id, order } of nextOrders) {
                const current = categories.find((c) => c.id === id)
                if (!current || current.order === order) continue

                const updateDTO = mapCategoryPartialToUpdateDTO({ order })
                await updateCategoryM.mutateAsync({ id, ...updateDTO })
              }
              await invalidateMenu()
              notify.success(t.establishmentAdmin.notifications?.categoryReordered ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.categoryReorderError ?? '✖')
            }
          }}
          onEdit={(id) => {
            const cat = categories.find((c) => c.id === id)
            if (cat) openDrawer({ type: 'category', mode: 'edit', data: cat as any })
          }}
        />
      </aside>

      <main className="admin-menu__panel">
        <ProductTable
          lang={lang}
          allergens={allergens}
          products={products as any}
          onRowClick={(id) => setSelectedProductId(id)}
          onCreate={async () => {
            if (!selectedCategoryId) return
            openDrawer({
              type: 'product',
              mode: 'create',
              context: { categoryId: selectedCategoryId },
            })
          }}
          onUpdate={async (id, patch) => {
            const current = products.find((p) => p.id === id)
            if (!current) return
            try {
              await updateProductM.mutateAsync({ ...(current as any), ...patch })
              await invalidateMenu()
              notify.success(t.establishmentAdmin.notifications?.productUpdated ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.productUpdateError ?? '✖')
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteProductM.mutateAsync(id)
              await invalidateMenu()
              if (selectedProductId === id) setSelectedProductId(null)
              notify.success(t.establishmentAdmin.notifications?.productDeleted ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.productDeleteError ?? '✖')
            }
          }}
          onEdit={(id) => {
            const prod = products.find((p) => p.id === id)
            if (prod) openDrawer({ type: 'product', mode: 'edit', data: prod as any })
          }}
          onReorder={async (next) => {
            try {
              const currentMap = new Map(products.map((p: any) => [p.id, p.order]))
              const changes = next.filter(({ id, order }) => currentMap.get(id) !== order)
              await Promise.all(
                changes.map(async ({ id, order }) => {
                  const current = products.find((p: any) => p.id === id)
                  if (!current) return
                  await updateProductM.mutateAsync({ ...(current as any), order })
                })
              )
              await invalidateMenu()
              notify.success(t.establishmentAdmin.notifications?.productReordered ?? '✔')
            } catch {
              notify.error(t.establishmentAdmin.notifications?.productReorderError ?? '✖')
            }
          }}
        />
      </main>

      <EditDrawer
        open={drawerOpen}
        title={
          drawer?.type === 'category'
            ? t.establishmentAdmin.menuManagement.categories.title
            : drawer?.type === 'product'
            ? t.establishmentAdmin.menuManagement.products.title
            : drawer?.type === 'variant'
            ? t.establishmentAdmin.menuManagement.variants.title
            : ''
        }
        onClose={closeDrawer}
        lang={lang}
      >
        {drawer?.type === 'category' && (
          <CategoryForm
            langs={VISIBLE_LANGS}
            initialValues={
              drawer.mode === 'edit'
                ? (drawer.data as MenuCategory)
                : ({
                    id: 0,
                    order:
                      drawer?.context?.orderHint ??
                      (categories.length > 0
                        ? Math.max(...categories.map((c: any) => c.order ?? 0)) + 1
                        : 1),
                    active: true,
                    translations: {
                      es: { name: '' },
                      en: { name: '' },
                      fr: { name: '' },
                    },
                  } as MenuCategory)
            }
            uiLang={lang}
            onSubmit={async (values) => {
              console.log('[AdminMenuManager] CategoryForm onSubmit called with values:', values)
              try {
                if (drawer.mode === 'create') {
                  console.log('[AdminMenuManager] Creating category with establishmentId:', estId)
                  const createDTO = mapCategoryUIToCreateDTO(values)
                  console.log('[AdminMenuManager] Create DTO with all translations:', createDTO)
                  await createCategoryM.mutateAsync(createDTO)
                  console.log('[AdminMenuManager] Category created successfully')
                  notify.success(t.establishmentAdmin.notifications?.categoryCreated ?? '✔')
                } else {
                  console.log('[AdminMenuManager] Updating category')
                  const updateDTO = mapCategoryUIToUpdateDTO(values)
                  console.log('[AdminMenuManager] Update DTO with all translations:', updateDTO)
                  await updateCategoryM.mutateAsync({ id: drawer.data!.id, ...updateDTO })
                  console.log('[AdminMenuManager] Category updated successfully')
                  notify.success(t.establishmentAdmin.notifications?.categoryUpdated ?? '✔')
                }
                await invalidateMenu()
                setTimeout(() => closeDrawer(), 1200)
              } catch (err) {
                console.error('[AdminMenuManager] Create/Update category error:', err)
                console.error('[AdminMenuManager] Error details:', {
                  message: err instanceof Error ? err.message : String(err),
                  error: err,
                })
                notify.error(t.establishmentAdmin.notifications?.categorySaveError ?? '✖')
              }
            }}
          />
        )}

        {drawer?.type === 'product' && (
          <ProductForm
            langs={VISIBLE_LANGS}
            allergens={allergens}
            initialValues={
              drawer.mode === 'edit'
                ? (drawer.data as MenuProduct)
                : ({
                    id: 0,
                    categoryId: drawer.context?.categoryId ?? selectedCategoryId ?? 0,
                    price: 0,
                    active: true,
                    allergens: [],
                    translations: {
                      es: { name: '', description: '' },
                      en: { name: '', description: '' },
                      fr: { name: '', description: '' },
                    },
                  } as MenuProduct)
            }
            onSubmit={async (values) => {
              try {
                if (drawer.mode === 'create') {
                  await createProductM.mutateAsync(values)
                  notify.success(t.establishmentAdmin.notifications?.productCreated ?? '✔')
                } else {
                  await updateProductM.mutateAsync(values)
                  notify.success(t.establishmentAdmin.notifications?.productUpdated ?? '✔')
                }
                await invalidateMenu()
                setTimeout(() => closeDrawer(), 1200)
              } catch {
                notify.error(t.establishmentAdmin.notifications?.productSaveError ?? '✖')
              }
            }}
            uiLang={lang}
          />
        )}

        {drawer?.type === 'variant' && (
          <VariantForm
            langs={VISIBLE_LANGS}
            initialValues={
              drawer.mode === 'edit'
                ? (drawer.data as ProductVariant)
                : ({
                    id: 0,
                    productId: selectedProductId ?? 0,
                    priceModifier: 0,
                    active: true,
                    translations: {
                      es: { name: '', description: '' },
                      en: { name: '', description: '' },
                      fr: { name: '', description: '' },
                    },
                  } as ProductVariant)
            }
            onSubmit={async (values) => {
              try {
                if (drawer.mode === 'create') {
                  await createVariantM.mutateAsync(values)
                  notify.success(t.establishmentAdmin.notifications?.variantCreated ?? '✔')
                } else {
                  await updateVariantM.mutateAsync(values)
                  notify.success(t.establishmentAdmin.notifications?.variantUpdated ?? '✔')
                }
                await invalidateMenu()
                setTimeout(() => closeDrawer(), 1200)
              } catch {
                notify.error(t.establishmentAdmin.notifications?.variantSaveError ?? '✖')
              }
            }}
            uiLang={lang}
          />
        )}
      </EditDrawer>
    </div>
  )
}
