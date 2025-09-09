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

  // Selección
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // Drawer
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const openDrawer = (entity: DrawerEntity) => {
    setDrawer(entity)
    setDrawerOpen(true)
  }
  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawer(null)
  }

  // Queries + Mutations (TanStack Query)
  const {
    categoriesQ,
    createM: createCategoryM,
    updateM: updateCategoryM,
    deleteM: deleteCategoryM,
  } = useCategories(estId)
  const allergensQ = useAllergens(estId)
  const {
    productsQ,
    createM: createProductM,
    updateM: updateProductM,
    deleteM: deleteProductM,
  } = useProducts(estId, selectedCategoryId)
  const {
    variantsQ,
    createM: createVariantM,
    updateM: updateVariantM,
    deleteM: deleteVariantM,
  } = useVariants(estId, selectedProductId)

  // Auto-selección por defecto al cargar datos
  useEffect(() => {
    if (categoriesQ.data?.length && selectedCategoryId == null) {
      setSelectedCategoryId(categoriesQ.data[0].id)
    }
  }, [categoriesQ.data, selectedCategoryId])

  useEffect(() => {
    if (!productsQ.data?.length) {
      setSelectedProductId(null)
    } else if (selectedProductId == null) {
      setSelectedProductId(productsQ.data[0].id)
    }
  }, [productsQ.data, selectedProductId])

  const categories = categoriesQ.data ?? []
  const products = productsQ.data ?? []
  const variants = variantsQ.data ?? []
  const allergens = allergensQ.data ?? []

  const loading =
    categoriesQ.isLoading || allergensQ.isLoading || productsQ.isLoading || variantsQ.isLoading

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

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <aside className="col-span-3">
        <CategoryList
          lang={lang}
          categories={categories}
          onSelect={(id) => {
            setSelectedCategoryId(id)
            setSelectedProductId(null)
          }}
          onCreate={async (draft) => {
            openDrawer({ type: 'category', mode: 'create', context: { orderHint: draft.order } })
          }}
          onDelete={async (id) => {
            await deleteCategoryM.mutateAsync(id)
            if (selectedCategoryId === id) {
              setSelectedCategoryId(null)
              setSelectedProductId(null)
            }
          }}
          onEdit={(id) => {
            const cat = categories.find((c) => c.id === id)
            if (cat) openDrawer({ type: 'category', mode: 'edit', data: cat })
          }}
        />
      </aside>

      <main className="col-span-9">
        <ProductTable
          lang={lang}
          allergens={allergens}
          products={products}
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
            await updateProductM.mutateAsync({ ...current, ...patch })
          }}
          onDelete={async (id) => {
            await deleteProductM.mutateAsync(id)
            if (selectedProductId === id) setSelectedProductId(null)
          }}
          onEdit={(id) => {
            const prod = products.find((p) => p.id === id)
            if (prod) openDrawer({ type: 'product', mode: 'edit', data: prod })
          }}
        />

        {selectedProductId && (
          <div className="mt-6">
            <VariantTable
              lang={lang}
              variants={variants}
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
                await updateVariantM.mutateAsync({ ...current, ...patch })
              }}
              onDelete={async (id) => {
                await deleteVariantM.mutateAsync(id)
              }}
              onEdit={(id) => {
                const v = variants.find((vv) => vv.id === id)
                if (v) openDrawer({ type: 'variant', mode: 'edit', data: v })
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
              closeDrawer()
            }}
          />
        )}
      </EditDrawer>
    </div>
  )
}
