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
import VariantTable from './VariantTable' // +
import { notify } from '@/utils/notify'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminMenu,
  type AdminMenuCategory,
  type AdminMenuProduct,
} from '@/services/api/menu.api'
import { useAllergens, useCategories, useProducts, useVariants } from '@/hooks/queries/menu'
import type { LanguageCode } from '@/constants/languages'
import type {
  DrawerEntity,
  MenuCategory,
  MenuProduct,
  ProductVariant,
} from '@/types/management/menu'

const LANGS: LanguageCode[] = ['es', 'en', 'fr']

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

  // Tab activa en drawer de producto
  const [productTab, setProductTab] = useState<'general' | 'variants'>('general') // +
  useEffect(() => {
    // Resetear al cambiar de entidad de drawer
    setProductTab('general')
  }, [drawer?.type, drawer?.mode])

  // Menú agregado
  const adminMenuQ = useQuery({
    queryKey: ['adminMenu', estId],
    queryFn: () => getAdminMenu(estId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  // Mutaciones
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

  const {
    createM: createVariantM,
    updateM: updateVariantM,
    deleteM: deleteVariantM,
  } = useVariants(estId, selectedProductId)

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
            <p>{t.establishmentAdmin.forms.loading}</p>
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
              notify.success((t as any).messages?.success?.categoryDeleted ?? '✔')
            } catch {
              notify.error((t as any).messages?.error?.categoryDeleteFailed ?? '✖')
            }
          }}
          onUpdate={async (id, patch) => {
            const current = categories.find((c) => c.id === id)
            if (!current) return
            try {
              await updateCategoryM.mutateAsync({ ...(current as any), ...patch })
              await invalidateMenu()
              notify.success((t as any).messages?.success?.categoryUpdated ?? '✔')
            } catch {
              notify.error((t as any).messages?.error?.categoryUpdateFailed ?? '✖')
            }
          }}
          onReorder={async (nextOrders) => {
            try {
              for (const { id, order } of nextOrders) {
                const current = categories.find((c) => c.id === id)
                if (!current || current.order === order) continue
                await updateCategoryM.mutateAsync({ ...(current as any), order })
              }
              await invalidateMenu()
              notify.success((t as any).messages?.success?.categoryUpdated ?? '✔')
            } catch {
              notify.error((t as any).messages?.error?.categoryUpdateFailed ?? '✖')
            }
          }}
          onEdit={(id) => {
            // NUEVO
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
              notify.success(
                t.establishmentAdmin.notifications?.productUpdated ??
                  (t as any).messages?.success?.productUpdated ??
                  '✔'
              )
            } catch {
              notify.error(
                t.establishmentAdmin.notifications?.productUpdateError ??
                  (t as any).messages?.error?.productUpdateFailed ??
                  '✖'
              )
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteProductM.mutateAsync(id)
              await invalidateMenu()
              if (selectedProductId === id) setSelectedProductId(null)
              notify.success((t as any).messages?.success?.productDeleted ?? '✔')
            } catch {
              notify.error((t as any).messages?.error?.productDeleteFailed ?? '✖')
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
              // Reutilizamos "actualizado"
              notify.success((t as any).messages?.success?.productUpdated ?? '✔')
            } catch {
              notify.error((t as any).messages?.error?.productUpdateFailed ?? '✖')
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
      >
        {drawer?.type === 'category' && (
          <CategoryForm
            langs={LANGS}
            initialValues={
              drawer.mode === 'edit'
                ? (drawer.data as MenuCategory)
                : {
                    id: 0,
                    order:
                      categories.length > 0
                        ? Math.max(...categories.map((c: any) => c.order ?? 0)) + 1
                        : 1,
                    active: true,
                    translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } },
                  }
            }
            onSubmit={async (values) => {
              try {
                if (drawer.mode === 'create') {
                  await createCategoryM.mutateAsync(values)
                  notify.success((t as any).messages?.success?.categoryCreated ?? '✔')
                } else {
                  await updateCategoryM.mutateAsync({ ...(drawer.data as any), ...values })
                  notify.success((t as any).messages?.success?.categoryUpdated ?? '✔')
                }
                await invalidateMenu()
                closeDrawer()
              } catch {
                notify.error(
                  (t as any).messages?.error?.[
                    drawer.mode === 'create' ? 'categoryCreateFailed' : 'categoryUpdateFailed'
                  ] ?? '✖'
                )
              }
            }}
          />
        )}

        {drawer?.type === 'product' && (
          <>
            {/* Tabs header (usar claves existentes) */}
            <div className="mb-4 border-b">
              <nav className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${
                    productTab === 'general'
                      ? 'border-b-2 border-black font-medium'
                      : 'text-neutral-500'
                  }`}
                  onClick={() => setProductTab('general')}
                >
                  {t.establishmentAdmin.tabs?.general ??
                    t.establishmentAdmin.menuManagement.products.title}
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${
                    productTab === 'variants'
                      ? 'border-b-2 border-black font-medium'
                      : 'text-neutral-500'
                  } ${drawer.mode === 'create' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => drawer.mode === 'edit' && setProductTab('variants')}
                  disabled={drawer.mode === 'create'}
                >
                  {t.establishmentAdmin.tabs?.variants ??
                    t.establishmentAdmin.menuManagement.variants.title}
                </button>
              </nav>
            </div>

            {productTab === 'general' && (
              <ProductForm
                langs={LANGS}
                allergens={allergens}
                initialValues={
                  drawer.mode === 'edit'
                    ? (drawer.data as MenuProduct)
                    : {
                        id: 0,
                        categoryId: drawer.context!.categoryId,
                        price: 0,
                        active: true,
                        allergens: [],
                        translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } },
                      }
                }
                onSubmit={async (values) => {
                  try {
                    if (drawer.mode === 'create') {
                      await createProductM.mutateAsync(values)
                      notify.success((t as any).messages?.success?.productCreated ?? '✔')
                    } else {
                      await updateProductM.mutateAsync(values)
                      notify.success((t as any).messages?.success?.productUpdated ?? '✔')
                    }
                    await invalidateMenu()
                    closeDrawer()
                  } catch {
                    notify.error(
                      (t as any).messages?.error?.[
                        drawer.mode === 'create' ? 'productCreateFailed' : 'productUpdateFailed'
                      ] ?? '✖'
                    )
                  }
                }}
              />
            )}

            {drawer.mode === 'edit' && productTab === 'variants' && (
              <div className="mt-2">
                <VariantTable
                  lang={lang}
                  variants={
                    (products.find((p) => p.id === (drawer.data as MenuProduct).id)?.variants ??
                      []) as any
                  }
                  onCreate={async () => {
                    openDrawer({
                      type: 'variant',
                      mode: 'create',
                      context: { productId: (drawer.data as MenuProduct).id },
                    })
                  }}
                  onUpdate={async (id, patch) => {
                    const prod = products.find((p) => p.id === (drawer.data as MenuProduct).id)
                    const current = prod?.variants?.find((v: any) => v.id === id)
                    if (!current) return
                    try {
                      await updateVariantM.mutateAsync({ ...(current as any), ...patch })
                      await invalidateMenu()
                      notify.success((t as any).messages?.success?.variantUpdated ?? '✔')
                    } catch {
                      notify.error((t as any).messages?.error?.variantUpdateFailed ?? '✖')
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await deleteVariantM.mutateAsync(id)
                      await invalidateMenu()
                      notify.success((t as any).messages?.success?.variantDeleted ?? '✔')
                    } catch {
                      notify.error((t as any).messages?.error?.variantDeleteFailed ?? '✖')
                    }
                  }}
                  onEdit={(id) => {
                    // NUEVO
                    const prod = products.find((p) => p.id === (drawer.data as MenuProduct).id)
                    const v = prod?.variants?.find((vv: any) => vv.id === id)
                    if (v) openDrawer({ type: 'variant', mode: 'edit', data: v as any })
                  }}
                />
              </div>
            )}
          </>
        )}

        {drawer?.type === 'variant' && (
          <VariantForm
            langs={LANGS}
            initialValues={
              drawer.mode === 'edit'
                ? (drawer.data as ProductVariant)
                : {
                    id: 0,
                    productId: drawer.context!.productId,
                    priceModifier: 0,
                    active: true,
                    translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } },
                  }
            }
            onSubmit={async (values) => {
              try {
                if (drawer.mode === 'create') {
                  await createVariantM.mutateAsync(values as any)
                  notify.success((t as any).messages?.success?.variantCreated ?? '✔')
                } else {
                  await updateVariantM.mutateAsync(values as any)
                  notify.success((t as any).messages?.success?.variantUpdated ?? '✔')
                }
                await invalidateMenu()
                closeDrawer()
              } catch {
                notify.error(
                  (t as any).messages?.error?.[
                    drawer.mode === 'create' ? 'variantCreateFailed' : 'variantUpdateFailed'
                  ] ?? '✖'
                )
              }
            }}
          />
        )}
      </EditDrawer>
    </div>
  )
}
