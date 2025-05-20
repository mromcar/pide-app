'use client'
import { useState, useCallback, useMemo } from 'react'
import LanguageSelector from './LanguageSelector'
import CategoryList from './CategoryList'
import ProductList from './ProductList'
import { ProductModal } from './ProductModal'
import OrderSummary from './OrderSummary'
import OrderHistory from './OrderHistory'
import { appContainerClasses } from '@/utils/tailwind'
import { Category, SerializedCategory, SerializedProduct, SerializedOrderItem } from '@/types/menu'
import type { OrderStatus } from '@prisma/client'
import { LanguageCode, AVAILABLE_LANGUAGES } from '@/constants/languages'
import { ORDER_STATUS } from '@/constants/enums'
import { serializeCategory } from '@/utils/serializers'

type OrderHistory = {
  code: string
  items: SerializedOrderItem[]
  total_amount: number
  date: string
  status: OrderStatus
  notes: string
  completedAt?: string
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
  categories: Category[]
  language: LanguageCode
  showProductsFromCategoryId?: number
}) {
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

  // Use centralized serialization
  const serializedCategories = useMemo(
    () => categories.map((category) => serializeCategory(category, language)),
    [categories, language]
  )

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
        .reduce((sum, variant) => sum + (order[variant.variant_id] || 0) * variant.price, 0),
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

        return {
          variant_id: variant.variant_id,
          variant_description: variant.variant_description,
          quantity,
          unit_price: variant.price,
        }
      })
      .filter(Boolean) as SerializedOrderItem[]

    setOrderHistory((prev) => [
      ...prev,
      {
        code: generateOrderCode(),
        items: orderItems,
        total_amount: calculateTotal(),
        date: new Date().toLocaleString(),
        status: ORDER_STATUS.PENDING,
        notes,
      },
    ])

    setOrder({})
    setNotes('')
    setOrderSent(true)
    setSelectedCategory(null)
    setSelectedProduct(null)
  }

  const saveEditedNote = () => {
    if (editingNote) {
      setOrderHistory((prev) =>
        prev.map((p, idx) => (idx === editingNote.idx ? { ...p, notes: editingNote.text } : p))
      )
      setEditingNote(null)
    }
  }

  const cancelOrder = (idx: number) => {
    setOrderHistory((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, status: ORDER_STATUS.CANCELLED } : p))
    )
  }

  if (orderSent) {
    return (
      <main className={appContainerClasses}>
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Order placed!</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setOrderSent(false)}
        >
          Place another order
        </button>
        <OrderHistory
          orderHistory={orderHistory}
          cancelOrder={cancelOrder}
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          saveEditedNote={saveEditedNote}
          onStatusChange={(orderId, newStatus) =>
            setOrderHistory((prev) =>
              prev.map((order, idx) =>
                idx === orderId
                  ? {
                      ...order,
                      status: newStatus,
                      ...(newStatus === ORDER_STATUS.COMPLETED && {
                        completedAt: new Date().toLocaleString(),
                      }),
                    }
                  : order
              )
            )
          }
        />
      </main>
    )
  }

  if (selectedProduct !== null) {
    return (
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        handleChange={handleChange}
        order={order}
        finishOrder={finishOrder}
        total={calculateTotal()}
        language={language}
      />
    )
  }

  if (selectedCategory !== null) {
    const category = serializedCategories.find((cat) => cat.category_id === selectedCategory)
    const showBackButton = !showProductsFromCategoryId
    const title =
      categories.length === 1 && showProductsFromCategoryId ? establishment?.name : category?.name

    return (
      <main className={appContainerClasses}>
        <LanguageSelector language={language} availableLanguages={AVAILABLE_LANGUAGES} />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{establishment?.name}</h1>
        {showBackButton && (
          <button className="mb-4 text-blue-600" onClick={() => setSelectedCategory(null)}>
            ← Back to categories
          </button>
        )}
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">{title}</h2>
        <ProductList
          products={category?.products ?? []}
          onSelectProduct={(product) => setSelectedProduct(product)}
          handleChange={handleChange}
          order={order}
          language={language}
        />
        <OrderSummary
          total={calculateTotal()}
          notes={notes}
          setNotes={setNotes}
          finishOrder={finishOrder}
          disabled={calculateTotal() === 0}
        />
      </main>
    )
  }

  return (
    <main className={appContainerClasses}>
      <LanguageSelector language={language} availableLanguages={AVAILABLE_LANGUAGES} />
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
        {establishment?.name ?? 'Restaurant Menu'}
      </h1>
      <CategoryList
        categories={serializedCategories}
        onSelectCategory={setSelectedCategory}
        language={language}
      />
      <OrderSummary
        total={calculateTotal()}
        notes={notes}
        setNotes={setNotes}
        finishOrder={finishOrder}
        disabled={calculateTotal() === 0}
      />
    </main>
  )
}
