'use client'
import { useState, useCallback, useMemo } from 'react'
import LanguageSelector from './LanguageSelector'
import CategoryList from './CategoryList'
import ProductList from './ProductList'
import { ProductModal } from './ProductModal'
import OrderSummary from './OrderSummary'
import OrderHistory from './OrderHistory'
import { appContainerClasses } from '@/utils/tailwind'
import { Category, Product, OrderStatus } from '@/types/menu'
import { AvailableLanguage, AVAILABLE_LANGUAGES } from '@/constants/languages'
import { uiTranslations } from '@/translations/ui'


type OrderHistory = {
  code: string
  items: {
    variant_id: number
    variant_description: string
    quantity: number
    unit_price: number
  }[]
  total_amount: number
  date: string
  status: OrderStatus
  notes: string
}

function generateOrderCode() {
  return `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
}

export default function MenuClient({
  establishment,
  categories,
  language,
  showProductsFromCategoryId,
}: {
  establishment: { name: string } | null
  categories: SerializedCategory[]
  language: AvailableLanguage
  showProductsFromCategoryId?: number
}) {
  // Initialize state variables at the top of the component
  const t = uiTranslations[language.code]
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    showProductsFromCategoryId ?? null
  )
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null)
  const [order, setOrder] = useState<{ [variantId: number]: number }>({})
  const [orderSent, setOrderSent] = useState(false)
  const [notes, setNotes] = useState('')
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [editingNote, setEditingNote] = useState<{
    idx: number
    text: string
  } | null>(null)

  // Translation and serialization
  const serializedCategories = categories.map((category) => {
    const categoryTranslation = category.translations?.find((t) => t.language_code === language.code)

    return {
      ...category,
      name: categoryTranslation?.name ?? category.name,
      products: (category.products ?? []).map((product: Product) => {
        const translation = product.translations?.find((t) => t.language_code === language.code)
        const variantTranslations = product.variants?.map((variant) => ({
          ...variant,
          translation: variant.translations?.find((t) => t.language_code === language.code),
        }))

        return {
          ...product,
          name: translation?.name ?? product.name,
          description: translation?.description ?? product.description ?? null, // Handle null case
          variants: variantTranslations ?? [],
          translations: product.translations ?? [],
        } as Product // Type assertion to ensure compatibility
      }),
    }
  })

  const handleChange = (variantId: number, delta: number) => {
    setOrder((prev) => {
      const next = { ...prev, [variantId]: Math.max(0, (prev[variantId] || 0) + delta) }
      if (next[variantId] === 0) delete next[variantId]
      return next
    })
  }

  const calculateTotal = useCallback(
    () =>
      serializedCategories
        .flatMap((cat) => cat.products)
        .flatMap((prod) => prod.variants)
        .reduce(
          (sum, variant) => sum + (order[variant.variant_id] || 0) * Number(variant.price),
          0
        ),
    [serializedCategories, order]
  )

  // Finish order and save to history
  const finishOrder = () => {
    const orderItems = Object.entries(order)
      .map(([variantId, quantity]) => {
        const variant = serializedCategories
          .flatMap((cat) => cat.products)
          .flatMap((prod) => prod.variants)
          .find((v) => v.variant_id === Number(variantId))

        if (!variant) return null

        // Find the product corresponding to the variant
        const product = serializedCategories
          .flatMap((cat) => cat.products)
          .find((prod) =>
            prod.variants.some((v) => v.variant_id === Number(variantId))
          )

        // Ensure product and variants exist
        if (!product) return null

        const variantTranslations = product.variants?.map((variant) => ({
          ...variant,
          translation: variant.translations?.find((t) => t.language_code === language.code),
        }))

        return {
          variant_id: variant.variant_id,
          variant_description:
            variantTranslations?.find((v) => v.variant_id === variant.variant_id)?.variant_description ??
            variant.variant_description,
          quantity,
          unit_price: Number(variant.price), // Convert Decimal to number
        }
      })
      .filter(Boolean) as OrderHistory['items']

    setOrderHistory((prev) => [
      ...prev,
      {
        code: generateOrderCode(),
        items: orderItems,
        total_amount: calculateTotal(),
        date: new Date().toLocaleString(),
        status: OrderStatus.PENDING,
        notes,
      },
    ])

    // Reset state
    setOrder({})
    setNotes('')
    setOrderSent(true)
    setSelectedCategory(null)
    setSelectedProduct(null)
  }

  // Modify note of a pending order
  const saveEditedNote = () => {
    if (editingNote) {
      setOrderHistory((prev) =>
        prev.map((p, idx) => (idx === editingNote.idx ? { ...p, notes: editingNote.text } : p))
      )
      setEditingNote(null)
    }
  }

  // Cancel pending order
  const cancelOrder = (idx: number) => {
    setOrderHistory((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, status: OrderStatus.CANCELLED } : p))
    )
  }

  // VIEW OF SENT ORDER + HISTORY
  if (orderSent) {
    return (
      <main className="appContainer">
        <h1 className="title">{t.orderPlaced}</h1>
        <button
          className="btnMinimalista"
          onClick={() => setOrderSent(false)}
        >
          {t.placeAnotherOrder}
        </button>
        <OrderHistory
          orderHistory={orderHistory}
          cancelOrder={cancelOrder}
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          saveEditedNote={saveEditedNote}
        />
      </main>
    )
  }

  // VIEW OF PRODUCT MODAL
  // Only render ProductModal if selectedProduct exists
  if (selectedProduct !== null) {
    return (
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        handleChange={handleChange}
        order={order}
        finishOrder={finishOrder}
        total={calculateTotal()}
        language={language.code}
      />
    )
  }

  // VIEW OF PRODUCTS IN A CATEGORY
  if (selectedCategory !== null) {
    const category = serializedCategories.find((cat) => cat.category_id === selectedCategory)
    const showBackButton = !showProductsFromCategoryId
    const title =
      categories.length === 1 && showProductsFromCategoryId ? establishment?.name : category?.name

    return (
      <main className={appContainerClasses}>
        <LanguageSelector language={language.code} availableLanguages={AVAILABLE_LANGUAGES} />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{establishment?.name}</h1>
        {showBackButton && (
          <button className="mb-4 text-blue-600" onClick={() => setSelectedCategory(null)}>
            ← {t.backToCategories}
          </button>
        )}
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">{title}</h2>
        <ProductList
          products={category?.products ?? []}
          onSelectProduct={(product) => setSelectedProduct(product)}
          handleChange={handleChange}
          order={order}
          language={language.code}
        />
        <OrderSummary
          total={calculateTotal()}
          notes={notes}
          onNotesChange={setNotes}
          onFinishOrder={finishOrder}
          language={language}
          disabled={calculateTotal() === 0}
        />
      </main>
    )
  }

  // VIEW OF CATEGORIES
  return (
    <main className={appContainerClasses}>
      <LanguageSelector language={language.code} availableLanguages={AVAILABLE_LANGUAGES} />
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
        {establishment?.name ?? 'Restaurant Menu'}
      </h1>
      <CategoryList
        categories={serializedCategories}
        onSelectCategory={setSelectedCategory}
        language={language.code}
      />
      <OrderSummary
        total={calculateTotal()}
        notes={notes}
        onNotesChange={setNotes}
        onFinishOrder={finishOrder}
        language={language}
        disabled={calculateTotal() === 0}
      />
    </main>
  )
}
