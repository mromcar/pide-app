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
    establishmentId,
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
      if (!establishmentId) {
        console.error('🚨 Cart: Establishment ID is missing')
        setError(t.cart.errorEstablishmentMissing)
        return
      }

      const orderItems = cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price,
      }))

      console.log('📦 Cart: Order items to send:', orderItems)

      const requestBody = {
        establishmentId,
        tableNumber,
        notes: orderNotes,
        items: orderItems,
      }

      console.log('📤 Cart: Request body:', requestBody)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📊 Cart: Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Cart: Order submission failed', {
          status: response.status,
          error: errorData,
        })
        setError(errorData.message || t.cart.errorSubmitting)
        return
      }

      const order = await response.json()
      console.log('✅ Cart: Order created successfully:', order)

      // Verificar inmediatamente si el pedido existe
      console.log('🔍 Cart: Verificando si el pedido existe...')
      const verifyResponse = await fetch(`/api/orders/${order.orderId}`)
      console.log('📊 Cart: Verify response status:', verifyResponse.status)

      const redirectUrl = `/${lang}/order/${order.orderId}`
      console.log('🔄 Cart: Redirecting to:', redirectUrl)

      // Limpiar el carrito y redirigir
      clearCart()
      router.push(redirectUrl)
    } catch (err) {
      console.error('🚨 Cart: Error submitting order:', err)
      setError(t.cart.errorSubmitting)
      setIsSubmittingOrder(false)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ ARREGLADO: Estado vacío sin hardcoding
  if (cartItems.length === 0 && !isSubmittingOrder) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">{t.cart.title}</h1>
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <p className="cart-empty-message">{t.cart.empty}</p>

          {establishmentId && (
            <button
              onClick={() => router.push(`/${lang}/${establishmentId}/menu`)}
              className="cart-back-to-menu-btn"
            >
              {t.cart.backToMenu}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ✅ ARREGLADO: Estado de envío sin hardcoding
  if (isSubmittingOrder) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">{t.cart.title}</h1>
        <div className="cart-submitting-state">
          <div className="cart-loading-spinner"></div>
          <p>{t.checkout.placingOrder}</p>
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
                    aria-label={`Disminuir cantidad de ${item.productName}`}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item.variantId, item.quantity)}
                    className="quantity-button"
                    aria-label={`Aumentar cantidad de ${item.productName}`}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item-total">{(item.price * item.quantity).toFixed(2)}€</span>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <strong>
              {t.cart.total}: {getCartTotal().toFixed(2)}€
            </strong>
          </div>

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
                required
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
                placeholder={t.checkout.notesPlaceholder}
                className="cart-field-textarea"
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isLoading || !tableNumber.trim() || !establishmentId}
            className="cart-place-order-btn"
            title={!tableNumber.trim() ? 'Ingresa el número de mesa' : ''}
          >
            {isLoading ? t.checkout.placingOrder : t.checkout.placeOrder}
          </button>

          {error && (
            <div className="cart-error">
              <span className="cart-error-icon">⚠️</span>
              <p className="cart-error-message">{error}</p>
            </div>
          )}

          {establishmentId && (
            <button
              onClick={() => router.push(`/${lang}/${establishmentId}/menu`)}
              className="cart-back-to-menu-btn-secondary"
              disabled={isLoading}
            >
              {t.cart.continueOrder}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
