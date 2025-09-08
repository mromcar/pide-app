import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import CategoryList from './CategoryList'
import ProductTable from './ProductTable'
import VariantTable from './VariantTable'
import EditDrawer from './drawers/EditDrawer'
import CategoryForm from './forms/CategoryForm'
import ProductForm from './forms/ProductForm'
import VariantForm from './forms/VariantForm'

import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
} from '@/services/api/category.api'
import { getAdminAllergens } from '@/services/api/allergen.api'
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
} from '@/services/api/product.api'
import {
  getAdminVariants,
  createAdminVariant,
  updateAdminVariant,
} from '@/services/api/variant.api'

import {
  mapCategoryUIToDTO,
  mapProductUIToDTO,
  mapVariantUIToDTO,
  mapCategoryDTOToUI,
  mapProductDTOToUI,
  mapVariantDTOToUI,
} from '@/services/mappers/menuMappers'

import type { LanguageCode } from '@/constants/languages'
import type {
  MenuCategory,
  MenuProduct,
  ProductVariant,
  DrawerEntity,
  UIAllergen,
} from '@/types/management/menu'

const LANGS: LanguageCode[] = ['es', 'en', 'fr']

interface Props {
  establishmentId: string
  lang: LanguageCode
}

export default function AdminMenuManager({ establishmentId, lang }: Props) {
  const { t } = useTranslation(lang)

  // Data
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [allergens, setAllergens] = useState<UIAllergen[]>([])

  // Selección
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // Drawer
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Load categories + allergens on mount
  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      try {
        const [catDTOs, allgs] = await Promise.all([
          getAdminCategories(Number(establishmentId)),
          getAdminAllergens(Number(establishmentId)),
        ])
        if (cancelled) return
        const cats = catDTOs.map(mapCategoryDTOToUI)
        setCategories(cats)
        setAllergens(
          allgs.map(
            (a: { allergenId?: number; id?: number; name?: string; allergenName?: string }) => ({
              id: a.allergenId ?? a.id ?? 0,
              name: a.name ?? a.allergenName ?? '',
            })
          )
        )
        setSelectedCategoryId(cats[0]?.id ?? null)
        setSelectedProductId(null)
        setProducts([])
        setVariants([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [establishmentId])

  // Load products when category changes
  useEffect(() => {
    let cancelled = false
    async function loadProducts() {
      if (!selectedCategoryId) {
        setProducts([])
        setSelectedProductId(null)
        return
      }
      const dto = await getAdminProducts(Number(establishmentId), {
        categoryId: selectedCategoryId,
      })
      if (cancelled) return
      const ui = dto.map(mapProductDTOToUI)
      setProducts(ui)
      setSelectedProductId(ui[0]?.id ?? null)
      setVariants([])
    }
    loadProducts().catch((e) => console.error('Failed to load products', e))
    return () => {
      cancelled = true
    }
  }, [establishmentId, selectedCategoryId])

  // Load variants when product changes
  useEffect(() => {
    let cancelled = false
    async function loadVariants() {
      if (!selectedProductId) {
        setVariants([])
        return
      }
      const dto = await getAdminVariants(Number(establishmentId), selectedProductId)
      if (cancelled) return
      setVariants(dto.map(mapVariantDTOToUI))
    }
    loadVariants().catch((e) => console.error('Failed to load variants', e))
    return () => {
      cancelled = true
    }
  }, [establishmentId, selectedProductId])

  const productsInCategory = useMemo(
    () => (selectedCategoryId ? products.filter((p) => p.categoryId === selectedCategoryId) : []),
    [products, selectedCategoryId]
  )

  const variantsOfProduct = useMemo(
    () => (selectedProductId ? variants.filter((v) => v.productId === selectedProductId) : []),
    [variants, selectedProductId]
  )

  const openDrawer = (entity: DrawerEntity) => {
    setDrawer(entity)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawer(null)
  }

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
            setCategories((prev) => prev.filter((c) => c.id !== id))
            if (selectedCategoryId === id) {
              setSelectedCategoryId(null)
              setSelectedProductId(null)
              setProducts([])
              setVariants([])
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
          products={productsInCategory}
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
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
          }}
          onDelete={async (id) => {
            setProducts((prev) => prev.filter((p) => p.id !== id))
            if (selectedProductId === id) {
              setSelectedProductId(null)
              setVariants([])
            }
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
              variants={variantsOfProduct}
              onCreate={async () => {
                openDrawer({
                  type: 'variant',
                  mode: 'create',
                  context: { productId: selectedProductId },
                })
              }}
              onUpdate={async (id, patch) => {
                setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
              }}
              onDelete={async (id) => {
                setVariants((prev) => prev.filter((v) => v.id !== id))
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
                ? drawer.data!
                : {
                    id: 0,
                    order: (categories.at(-1)?.order ?? 0) + 1,
                    active: true,
                    translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } },
                  }
            }
            onSubmit={async (values) => {
              try {
                if (drawer.mode === 'create') {
                  const created = await createAdminCategory(
                    Number(establishmentId),
                    mapCategoryUIToDTO(values)
                  )
                  const ui = mapCategoryDTOToUI(created)
                  setCategories((prev) => [...prev, ui].sort((a, b) => a.order - b.order))
                  setSelectedCategoryId((prev) => prev ?? ui.id)
                } else {
                  const updated = await updateAdminCategory(
                    Number(establishmentId),
                    values.id,
                    mapCategoryUIToDTO(values)
                  )
                  const ui = mapCategoryDTOToUI(updated)
                  setCategories((prev) => prev.map((c) => (c.id === ui.id ? ui : c)))
                }
                closeDrawer()
              } catch (e) {
                console.error('Category save failed', e)
              }
            }}
          />
        )}

        {drawer?.type === 'product' && (
          <ProductForm
            langs={LANGS}
            allergens={allergens}
            initialValues={
              drawer.mode === 'edit'
                ? drawer.data!
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
              try {
                if (drawer.mode === 'create') {
                  const created = await createAdminProduct(
                    Number(establishmentId),
                    mapProductUIToDTO(values)
                  )
                  const ui = mapProductDTOToUI(created)
                  setProducts((prev) => [...prev, ui])
                  setSelectedProductId(ui.id)
                } else {
                  const updated = await updateAdminProduct(
                    Number(establishmentId),
                    values.id,
                    mapProductUIToDTO(values)
                  )
                  const ui = mapProductDTOToUI(updated)
                  setProducts((prev) => prev.map((p) => (p.id === ui.id ? ui : p)))
                }
                closeDrawer()
              } catch (e) {
                console.error('Product save failed', e)
              }
            }}
          />
        )}

        {drawer?.type === 'variant' && (
          <VariantForm
            langs={LANGS}
            initialValues={
              drawer.mode === 'edit'
                ? drawer.data!
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
                  const created = await createAdminVariant(
                    Number(establishmentId),
                    mapVariantUIToDTO(values)
                  )
                  const ui = mapVariantDTOToUI(created)
                  setVariants((prev) => [...prev, ui])
                } else {
                  const updated = await updateAdminVariant(
                    Number(establishmentId),
                    values.id,
                    mapVariantUIToDTO(values)
                  )
                  const ui = mapVariantDTOToUI(updated)
                  setVariants((prev) => prev.map((v) => (v.id === ui.id ? ui : v)))
                }
                closeDrawer()
              } catch (e) {
                console.error('Variant save failed', e)
              }
            }}
          />
        )}
      </EditDrawer>
    </div>
  )
}
