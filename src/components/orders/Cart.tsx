'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface CartProps {
  lang: LanguageCode
}

export default function Cart({ lang }: CartProps) {
  const {
    cartItems,
    getCartTotal,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    restaurantId,
    tableNumber,
    setTableNumber,
    orderNotes,
    setOrderNotes,
  } = useCart()
  const t = getTranslation(lang)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  const handleIncrease = (variantId: number, currentQuantity: number) => {
    updateCartItemQuantity(variantId, currentQuantity + 1)
  }

  const handleDecrease = (variantId: number, currentQuantity: number) => {
    if (currentQuantity - 1 > 0) {
      updateCartItemQuantity(variantId, currentQuantity - 1)
    } else {
      removeFromCart(variantId)
    }
  }

  const handleSubmitOrder = async () => {
    setIsLoading(true)
    setIsSubmittingOrder(true)
    setError(null)

    try {
      if (!restaurantId) {
        console.error('Restaurant ID is missing')
        setError('Restaurant ID is missing')
        return
      }

      // Convierte los items a snake_case solo para el backend
      const orderItems = cartItems.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const requestBody = {
        establishment_id: restaurantId,
        table_number: tableNumber,
        notes: orderNotes,
        items: orderItems,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al enviar el pedido')
        return
      }

      const order = await response.json()

      // Verificar inmediatamente si el pedido existe
      await fetch(`/api/orders/${order.order_id}`)

      const redirectUrl = `/${lang}/order/${order.order_id}?restaurantId=${restaurantId}`

      clearCart()
      router.push(redirectUrl)
    } catch (err) {
      console.error('Error submitting order:', err)
      setError('Error al enviar el pedido')
      setIsSubmittingOrder(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (cartItems.length === 0 && !isSubmittingOrder) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">{t.cart?.title || 'Carrito de compra'}</h1>
        <p>{t.cart?.empty || 'Tu carrito está vacío'}</p>
      </div>
    )
  }

  if (isSubmittingOrder) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">{t.cart?.title || 'Carrito de compra'}</h1>
        <div className="text-center">
          <p>{t.checkout?.placingOrder || 'Realizando Pedido...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">{t.cart.title}</h2>
      {cartItems.length === 0 ? (
        <p>{t.cart.empty}</p>
      ) : (
        <div>
          <ul className="cart-items-list">
            {cartItems.map((item) => (
              <li key={item.variantId} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.productName}</span>
                  {item.variantDescription && (
                    <span className="cart-item-variant">{item.variantDescription}</span>
                  )}
                </div>
                <div className="quantity-selector-persistent">
                  <button
                    onClick={() => handleDecrease(item.variantId, item.quantity)}
                    className="quantity-button"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item.variantId, item.quantity)}
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>
                <span>{(item.price * item.quantity).toFixed(2)}€</span>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <strong>
              {t.cart.total}: {getCartTotal().toFixed(2)}€
            </strong>
          </div>

          {/* Campos de mesa y notas */}
          <div className="cart-order-details">
            <div className="cart-field-group">
              <label htmlFor="tableNumber" className="cart-field-label">
                {t.checkout.tableNumber}
              </label>
              <input
                id="tableNumber"
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder={t.checkout.tableNumber}
                className="cart-field-input"
              />
            </div>

            <div className="cart-field-group">
              <label htmlFor="orderNotes" className="cart-field-label">
                {t.checkout.notes}
              </label>
              <textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={t.checkout.notes}
                className="cart-field-textarea"
                rows={3}
              />
            </div>
          </div>

          <button onClick={handleSubmitOrder} disabled={isLoading} className="cart-place-order-btn">
            {isLoading ? t.checkout.placingOrder : t.checkout.placeOrder}
          </button>

          {error && <p className="cart-error">{error}</p>}
        </div>
      )}
    </div>
  )
}
