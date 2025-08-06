'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'
import { useCart } from '@/lib/cart-context'
import type {
  OrderWithDetails,
  OrderItemWithDetails,
  OrderItemTranslation,
  OrderItemVariantTranslation,
} from '@/types/orderConfirmation'

interface OrderConfirmationProps {
  lang: LanguageCode
  orderId: number
  restaurantId: number
}

export default function OrderConfirmation({ lang, orderId, restaurantId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = getTranslation(lang)
  const { setRestaurantId } = useCart()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('Fetching order with ID:', orderId)
        console.log('Restaurant ID:', restaurantId)

        // Usar la nueva API pública
        const response = await fetch(`/api/orders/${orderId}`)
        console.log('Fetch response status:', response.status)

        if (response.ok) {
          const orderData: OrderWithDetails = await response.json()
          console.log('Order data received:', orderData)
          setOrder(orderData)
          // Asegurar que el restaurantId esté configurado en el carrito
          setRestaurantId(orderData.establishment_id)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch order:', response.status, errorText)
          setError('Order not found')
          // Si hay error, redirigir al menú después de 3 segundos
          setTimeout(() => {
            router.push(`/${lang}/restaurant/${restaurantId}/menu`)
          }, 3000)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Failed to load order')
        // Si hay error, redirigir al menú después de 3 segundos
        setTimeout(() => {
          router.push(`/${lang}/restaurant/${restaurantId}/menu`)
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, restaurantId, router, lang, setRestaurantId])

  const handleOrderAgain = () => {
    // Redirigir al menú del restaurante
    router.push(`/${lang}/restaurant/${restaurantId}/menu`)
  }

  const getProductName = (item: OrderItemWithDetails): string => {
    // Obtener el nombre del producto desde las traducciones
    const translation = item.variant?.product?.translations?.find(
      (t: OrderItemTranslation) => t.language_code === lang
    )
    return translation?.name || item.variant?.product?.name || `Product ${item.variant_id}`
  }

  const getVariantDescription = (item: OrderItemWithDetails): string | undefined => {
    // Obtener la descripción de la variante desde las traducciones
    const translation = item.variant?.translations?.find(
      (t: OrderItemVariantTranslation) => t.language_code === lang
    )
    return translation?.variant_description || item.variant?.variant_description
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="order-confirmation-loading">
          <div className="order-confirmation-spinner"></div>
          <p>{t.orderConfirmation?.loading || 'Loading your order...'}</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div className="order-confirmation-error">
          <h1 className="order-confirmation-error-title">
            {error === 'Order not found'
              ? t.orderConfirmation?.orderNotFound || 'Order not found'
              : t.orderConfirmation?.failedToLoad || 'Failed to load order'}
          </h1>
          <p>{t.orderConfirmation?.redirectingToMenu || 'Redirecting to menu...'}</p>
          <button
            onClick={() => router.push(`/${lang}/restaurant/${restaurantId}/menu`)}
            className="btnMinimalista order-confirmation-back-btn"
          >
            {t.orderConfirmation?.backToMenu || 'Back to Menu'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="order-confirmation-container">
        <div className="order-confirmation-header">
          <div className="order-confirmation-success-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="order-confirmation-title">
            {t.orderConfirmation?.title || 'Order Confirmed!'}
          </h1>
          <p className="order-confirmation-subtitle">
            {t.orderConfirmation?.subtitle || 'Your order has been successfully placed'}
          </p>
        </div>

        <div className="order-confirmation-card">
          <div className="order-confirmation-card-header">
            <h2 className="order-confirmation-order-title">Order #{order.order_id}</h2>
            {order.table_number && (
              <p className="order-confirmation-table">Table: {order.table_number}</p>
            )}
            <p className="order-confirmation-status">
              Status: {t.orderStatus?.[order.status.toLowerCase()] || order.status}
            </p>
            <p className="order-confirmation-date">
              {new Date(order.created_at).toLocaleString(
                lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US'
              )}
            </p>
          </div>

          <div className="order-confirmation-items">
            <h3 className="order-confirmation-items-title">
              {t.orderSummary?.title || 'Order Items:'}:
            </h3>
            {order.order_items?.map((item: OrderItemWithDetails, index: number) => (
              <div key={index} className="order-confirmation-item">
                <div className="order-confirmation-item-info">
                  <p className="order-confirmation-item-name">{getProductName(item)}</p>
                  {getVariantDescription(item) && (
                    <p className="order-confirmation-item-variant">{getVariantDescription(item)}</p>
                  )}
                  <p className="order-confirmation-item-quantity">
                    {t.orderSummary?.quantity || 'Quantity'}: {item.quantity}
                  </p>
                </div>
                <p className="order-confirmation-item-price">
                  {(Number(item.unit_price) * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          {order.total_amount && (
            <div className="order-confirmation-total">
              <div className="order-confirmation-total-row">
                <span className="order-confirmation-total-label">{t.cart?.total || 'Total'}:</span>
                <span className="order-confirmation-total-amount">
                  {Number(order.total_amount).toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="order-confirmation-notes">
              <p>
                <strong>{t.checkout?.notes || 'Notes'}:</strong> {order.notes}
              </p>
            </div>
          )}
        </div>

        <div className="order-confirmation-actions">
          <button
            onClick={handleOrderAgain}
            className="btnMinimalista order-confirmation-order-again-btn"
          >
            {t.orderConfirmation?.orderAgain || 'Order Again'}
          </button>
          <button
            onClick={() =>
              router.push(`/${lang}/order/${orderId}/track?restaurantId=${restaurantId}`)
            }
            className="btnMinimalista order-confirmation-track-btn"
          >
            {t.orderConfirmation?.trackOrder || 'Track Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
