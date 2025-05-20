// src/app/restaurant/[id]/menu/components/MenuClient.tsx
'use client'
import { useState, useCallback, useMemo } from 'react'
import LanguageSelector from './LanguageSelector'
import CategoryList from './CategoryList'
import ProductList from './ProductList'
import { ProductModal } from './ProductModal'
import OrderSummary from './OrderSummary' // Este componente necesitará actualizarse
import OrderHistory from './OrderHistory' // Este componente necesitará actualizarse
import { appContainerClasses } from '@/utils/tailwind'
import { SerializedCategory, SerializedProduct } from '@/types/menu'
import { useOrderStore } from '@/store/orderStore' // Importa tu store de Zustand
import { createClientOrder } from '@/services/orderServices' // Importa el servicio para crear pedidos
import { CreateOrderItemDTO } from '@/types/dtos'
import { ORDER_STATUS } from '@/constants/enums' // Si usas ORDER_STATUS como string
import type { OrderStatus } from '@prisma/client' // Para el tipo OrderStatus de Prisma
import { LanguageCode, AVAILABLE_LANGUAGES } from '@/constants/languages'
import { uiTranslations } from '@/translations/ui' // Para tus traducciones UI

// Tipo para el historial de pedidos (ahora desde la API)
import { SerializedOrder } from '@/types/order' // El tipo de orden serializada que viene del backend

export default function MenuClient({
  establishment,
  categories,
  language,
  // showProductsFromCategoryId ya no es necesario aquí si siempre se muestra la lista de categorías
}: {
  establishment: { name: string } | null
  categories: SerializedCategory[] // Ahora recibimos categorías ya serializadas
  language: LanguageCode // Cambiado a LanguageCode directamente
  // showProductsFromCategoryId?: number; // Eliminar si no se usa
}) {
  const t = uiTranslations[language] // Accede a las traducciones
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null)
  const [isOrderSending, setIsOrderSending] = useState(false) // Para manejar el estado de envío
  const [orderError, setOrderError] = useState<string | null>(null) // Para errores del pedido
  const [lastSentOrder, setLastSentOrder] = useState<SerializedOrder | null>(null) // Para mostrar el último pedido enviado

  // Usa tu store de Zustand
  const {
    cartItems,
    tableNumber,
    notes,
    updateQuantity,
    setTableNumber,
    setNotes,
    clearCart,
    getCartTotal,
  } = useOrderStore()

  const handleChange = (variantId: number, delta: number) => {
    updateQuantity(variantId, delta)
  }

  const currentCategory = useMemo(
    () => serializedCategories.find((cat) => cat.category_id === selectedCategory),
    [selectedCategory, serializedCategories]
  )

  const handleFinishOrder = async () => {
    // Validaciones básicas antes de enviar
    if (getCartTotal() === 0) {
      setOrderError(t.emptyCartError) // "El carrito está vacío."
      return
    }
    if (!tableNumber) {
      setOrderError(t.tableNumberRequired) // "El número de mesa es requerido."
      return
    }

    setIsOrderSending(true)
    setOrderError(null)

    // Mapear los ítems del carrito al formato esperado por la API (CreateOrderItemDTO)
    const itemsToCreate: CreateOrderItemDTO[] = cartItems.map((item) => ({
      variant_id: item.variant.variant_id,
      quantity: item.quantity,
    }))

    try {
      const newOrder = await createClientOrder({
        establishment_id: establishment?.establishment_id || 0, // Asegúrate de pasar el ID del establecimiento
        table_number: tableNumber,
        items: itemsToCreate,
        notes: notes,
      })

      setLastSentOrder(newOrder) // Guarda la orden recién creada
      clearCart() // Limpia el carrito después de un envío exitoso
      setSelectedCategory(null)
      setSelectedProduct(null)
    } catch (error: any) {
      console.error('Error al finalizar el pedido:', error)
      setOrderError(error.message || t.orderError) // "Hubo un error al procesar tu pedido."
    } finally {
      setIsOrderSending(false)
    }
  }

  // Lógica para mostrar el estado del pedido (simulada o real si tienes un endpoint)
  // Por ahora, OrderHistory mostrará el "lastSentOrder"
  const orderHistory = lastSentOrder ? [lastSentOrder] : []

  if (lastSentOrder) {
    return (
      <main className={appContainerClasses}>
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{t.orderPlaced}</h1>
        <p className="text-center text-lg text-green-600 mb-4">{t.orderConfirmationMessage}</p>
        <button
          className="btnMinimalista"
          onClick={() => setLastSentOrder(null)} // Permitir hacer otro pedido
          disabled={isOrderSending}
        >
          {t.placeAnotherOrder}
        </button>
        {/* Aquí puedes mostrar detalles del lastSentOrder o un OrderHistory que lo use */}
        <OrderHistory
          orders={orderHistory} // Pasas la orden real
          language={language}
          // No necesitamos las funciones de editar/cancelar aquí si el historial es solo para visualización inmediata
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
        order={cartItems.reduce(
          (acc, item) => ({ ...acc, [item.variant.variant_id]: item.quantity }),
          {}
        )} // Adapta para Zustand
        finishOrder={handleFinishOrder} // Usar la nueva función
        total={getCartTotal()} // Usar el total de Zustand
        language={language}
      />
    )
  }

  if (selectedCategory !== null) {
    const productsToShow = currentCategory?.products ?? []
    // const showBackButton = !showProductsFromCategoryId; // Si showProductsFromCategoryId ya no se usa, siempre mostrar el botón
    const title = categories.length === 1 ? establishment?.name : currentCategory?.name

    return (
      <main className={appContainerClasses}>
        <LanguageSelector language={language} availableLanguages={AVAILABLE_LANGUAGES} />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{establishment?.name}</h1>
        <button className="mb-4 text-blue-600" onClick={() => setSelectedCategory(null)}>
          ← {t.backToCategories}
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">{title}</h2>
        <ProductList
          products={productsToShow}
          onSelectProduct={(product) => setSelectedProduct(product)}
          handleChange={handleChange}
          order={cartItems.reduce(
            (acc, item) => ({ ...acc, [item.variant.variant_id]: item.quantity }),
            {}
          )} // Adapta para Zustand
          language={language}
        />
        <OrderSummary
          total={getCartTotal()} // Usa el total de Zustand
          notes={notes} // Usa las notas de Zustand
          onNotesChange={setNotes} // Usa la función de Zustand
          onFinishOrder={handleFinishOrder} // Usa la nueva función
          language={language} // Pasa el objeto language completo
          disabled={getCartTotal() === 0 || isOrderSending}
          isSending={isOrderSending} // Pasa el estado de envío
          orderError={orderError} // Pasa el error
          tableNumber={tableNumber} // Pasa el número de mesa
          onTableNumberChange={setTableNumber} // Función para cambiar el número de mesa
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
        language={language} // Asegúrate de pasar el código de idioma
      />
      <OrderSummary
        total={getCartTotal()} // Usa el total de Zustand
        notes={notes} // Usa las notas de Zustand
        onNotesChange={setNotes} // Usa la función de Zustand
        onFinishOrder={handleFinishOrder} // Usa la nueva función
        language={language} // Pasa el objeto language completo
        disabled={getCartTotal() === 0 || isOrderSending}
        isSending={isOrderSending} // Pasa el estado de envío
        orderError={orderError} // Pasa el error
        tableNumber={tableNumber} // Pasa el número de mesa
        onTableNumberChange={setTableNumber} // Función para cambiar el número de mesa
      />
    </main>
  )
}
