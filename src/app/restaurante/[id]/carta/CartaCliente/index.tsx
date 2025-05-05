'use client'
import { useState, useCallback, useMemo } from 'react'
import SelectorDeIdioma from './SelectorDeIdioma'
import ListaCategorias from './ListaCategorias'
import ListaProductos from './ListaProductos'
import ModalProducto from './ModalProducto'
import ResumenPedido from './ResumenPedido'
import HistorialPedidos from './HistorialPedidos'
import { appContainerClasses } from '@/utils/tailwind'
import { Category, Product, OrderStatus } from '@/types/carta'

const availableLanguages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

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

export default function CartaCliente({
  establishment,
  categories,
  language,
  showProductsFromCategoryId,
}: {
  establishment: { name: string } | null
  categories: Category[]
  language: string
  showProductsFromCategoryId?: number
}) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    showProductsFromCategoryId ?? null
  )
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [order, setOrder] = useState<{ [variantId: number]: number }>({})
  const [orderSent, setOrderSent] = useState(false)
  const [notes, setNotes] = useState('')
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [editingNote, setEditingNote] = useState<{
    idx: number
    text: string
  } | null>(null)

  // Translation and serialization
  const serializedCategories = categories.map((category) => ({
    ...category,
    products: (category.products ?? []).map((product: Product) => {
      const translation = product.translations?.find((t) => t.language_code === language)
      const variantTranslations = product.variants?.map(variant => ({
        ...variant,
        translation: variant.translations?.find(t => t.language_code === language)
      }))

      return {
        ...product,
        name: translation?.name ?? product.name,
        description: translation?.description ?? product.description,
        variants: variantTranslations ?? [],
        translations: product.translations ?? [],
      }
    }),
  }))

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

  const total = useMemo(calculateTotal, [calculateTotal])

  // Finish order and save to history
  const finishOrder = () => {
    const orderItems = Object.entries(order)
      .map(([variantId, quantity]) => {
        const variant = serializedCategories
          .flatMap((cat) => cat.products)
          .flatMap((prod) => prod.variants)
          .find((v) => v.variant_id === Number(variantId))

        return variant
          ? {
            variant_id: variant.variant_id,
            variant_description: variant.translation?.variant_description ?? variant.variant_description,
            quantity,
            unit_price: variant.price
          }
          : null
      })
      .filter(Boolean) as OrderHistory['items']

    setOrderHistory((prev) => [
      ...prev,
      {
        code: generateOrderCode(),
        items: orderItems,
        total_amount: total,
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
        prev.map((p, idx) =>
          idx === editingNote.idx ? { ...p, notes: editingNote.text } : p
        )
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
      <main className={appContainerClasses}>
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Order placed!</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setOrderSent(false)}
        >
          Place another order
        </button>
        <HistorialPedidos
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
  if (selectedProduct) {
    return (
      <ModalProducto
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        handleChange={handleChange}
        quantity={order[selectedProduct.id_producto] || 0}
        finishOrder={finishOrder}
        total={total}
      />
    )
  }

  // VIEW OF PRODUCTS IN A CATEGORY
  if (selectedCategory !== null) {
    const category = serializedCategories.find(
      (cat) => cat.id_categoria === selectedCategory
    )
    const showBackButton = !showProductsFromCategoryId
    const title =
      categories.length === 1 && showProductsFromCategoryId
        ? establishment?.name
        : category?.name

    return (
      <main className={appContainerClasses}>
        <SelectorDeIdioma language={language} availableLanguages={availableLanguages} />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{establishment?.name}</h1>
        {showBackButton && (
          <button className="mb-4 text-blue-600" onClick={() => setSelectedCategory(null)}>
            ← Back to categories
          </button>
        )}
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">{title}</h2>
        <ListaProductos
          products={category?.products ?? []}
          onSelectProduct={(product) => setSelectedProduct(product)}
          handleChange={handleChange}
          order={order}
          language={language}
        />
        <ResumenPedido
          total={total}
          notes={notes}
          setNotes={setNotes}
          finishOrder={finishOrder}
          disabled={total === 0}
        />
      </main>
    )
  }

  // VIEW OF CATEGORIES
  return (
    <main className={appContainerClasses}>
      <SelectorDeIdioma language={language} availableLanguages={availableLanguages} />
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
        {establishment?.name ?? 'Restaurant Menu'}
      </h1>
      <ListaCategorias
        categories={serializedCategories}
        onSelectCategory={setSelectedCategory}
      />
      <ResumenPedido
        total={total}
        notes={notes}
        setNotes={setNotes}
        finishOrder={finishOrder}
        disabled={total === 0}
      />
    </main>
  )
}
