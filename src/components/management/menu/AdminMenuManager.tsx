'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import CategoryList from './CategoryList'
import ProductTable from './ProductTable'
import VariantTable from './VariantTable'
import EditDrawer from './drawers/EditDrawer'
import CategoryForm from './forms/CategoryForm'
import ProductForm from './forms/ProductForm'
import VariantForm from './forms/VariantForm'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminMenu,
  type AdminMenuCategory,
  type AdminMenuProduct,
  type AdminMenuVariant,
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

  // Menú agregado (categorías -> productos -> variantes)
  const adminMenuQ = useQuery({
    queryKey: ['adminMenu', estId],
    queryFn: () => getAdminMenu(estId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  // Hooks de mutaciones existentes
  const {
    categoriesQ: _ignoredCategoriesQ,
    createM: createCategoryM,
    updateM: updateCategoryM,
    deleteM: deleteCategoryM,
  } = useCategories(estId)

  const allergensQ = useAllergens(estId)

  const {
    productsQ: _ignoredProductsQ,
    createM: createProductM,
    updateM: updateProductM,
    deleteM: deleteProductM,
  } = useProducts(estId, selectedCategoryId)

  const {
    variantsQ: _ignoredVariantsQ,
    createM: createVariantM,
    updateM: updateVariantM,
    deleteM: deleteVariantM,
  } = useVariants(estId, selectedProductId)

  // Datos auxiliares
  const allergens = allergensQ?.data ?? []

  // Derivados del menú agregado
  const categories: AdminMenuCategory[] = adminMenuQ.data?.categories ?? []
  const products: AdminMenuProduct[] =
    (selectedCategoryId != null
      ? categories.find((c) => c.id === selectedCategoryId)?.products
      : categories[0]?.products) ?? []
  const variants: AdminMenuVariant[] =
    (selectedProductId != null
      ? products.find((p) => p.id === selectedProductId)?.variants
      : products[0]?.variants) ?? []

  // Auto-selección inicial
  useEffect(() => {
    if (categories.length && selectedCategoryId == null) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  useEffect(() => {
    if (!products?.length) setSelectedProductId(null)
    else if (selectedProductId == null) setSelectedProductId(products[0].id)
  }, [products, selectedProductId])

  const loading = adminMenuQ.isLoading || allergensQ.isLoading

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-body">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{t.establishmentAdmin.forms.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  async function invalidateMenu() {
    await qc.invalidateQueries({ queryKey: ['adminMenu', estId] })
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
            await deleteCategoryM.mutateAsync(id)
            await invalidateMenu()
            if (selectedCategoryId === id) {
              setSelectedCategoryId(null)
              setSelectedProductId(null)
            }
          }}
          onEdit={(id) => {
            const cat = categories.find((c) => c.id === id)
            if (cat) openDrawer({ type: 'category', mode: 'edit', data: cat as any })
          }}
          onUpdate={async (id, patch) => {
            const current = categories.find((c) => c.id === id)
            if (!current) return
            await updateCategoryM.mutateAsync({ ...(current as any), ...patch })
            await invalidateMenu()
          }}
          onReorder={async (nextOrders) => {
            for (const { id, order } of nextOrders) {
              const current = categories.find((c) => c.id === id)
              if (!current || current.order === order) continue
              await updateCategoryM.mutateAsync({ ...(current as any), order })
            }
            await invalidateMenu()
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
            await updateProductM.mutateAsync({ ...(current as any), ...patch })
            await invalidateMenu()
          }}
          onDelete={async (id) => {
            await deleteProductM.mutateAsync(id)
            await invalidateMenu()
            if (selectedProductId === id) setSelectedProductId(null)
          }}
          onEdit={(id) => {
            const prod = products.find((p) => p.id === id)
            if (prod) openDrawer({ type: 'product', mode: 'edit', data: prod as any })
          }}
        />

        {selectedProductId && (
          <div className="mt-6">
            <VariantTable
              lang={lang}
              variants={variants as any}
              onCreate={async () => {
                openDrawer({
                  type: 'variant',
                  mode: 'create',
                  context: { productId: selectedProductId },
                })
              }}
              onUpdate={async (id, patch) => {
                const current = variants.find((v) => v.id === id)
                if (!current) return
                await updateVariantM.mutateAsync({ ...(current as any), ...patch })
                await invalidateMenu()
              }}
              onDelete={async (id) => {
                await deleteVariantM.mutateAsync(id)
                await invalidateMenu()
              }}
              onEdit={(id) => {
                const v = variants.find((vv) => vv.id === id)
                if (v) openDrawer({ type: 'variant', mode: 'edit', data: v as any })
              }}
            />
          </div>
        )}
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
                    order: (categories.at(-1)?.order ?? 0) + 1,
                    active: true,
                    translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } },
                  }
            }
            onSubmit={async (values) => {
              if (drawer.mode === 'create') await createCategoryM.mutateAsync(values)
              else await updateCategoryM.mutateAsync(values)
              await invalidateMenu()
              closeDrawer()
            }}
          />
        )}

        {drawer?.type === 'product' && (
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
                    translations: {
                      es: { name: '', description: '' },
                      en: { name: '', description: '' },
                      fr: { name: '', description: '' },
                    },
                  }
            }
            onSubmit={async (values) => {
              if (drawer.mode === 'create') await createProductM.mutateAsync(values)
              else await updateProductM.mutateAsync(values)
              await invalidateMenu()
              closeDrawer()
            }}
          />
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
              if (drawer.mode === 'create') await createVariantM.mutateAsync(values)
              else await updateVariantM.mutateAsync(values)
              await invalidateMenu()
              closeDrawer()
            }}
          />
        )}
      </EditDrawer>
    </div>
  )
}
