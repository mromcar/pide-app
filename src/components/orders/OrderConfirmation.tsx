'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'
import { useCart } from '@/lib/cart-context'
import type { OrderWithDetails, OrderItemWithDetails } from '@/types/orderConfirmation'

// ✅ CAMBIO: Interface actualizada
interface OrderConfirmationProps {
  lang: LanguageCode
  orderId: number
  establishmentId: number // ✅ CAMBIO: restaurantId → establishmentId
}

// ✅ CAMBIO: Parámetros actualizados
export default function OrderConfirmation({
  lang,
  orderId,
  establishmentId,
}: OrderConfirmationProps) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = getTranslation(lang)
  const { setEstablishmentId } = useCart()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('🔍 OrderConfirmation: Fetching order:', orderId)
        const response = await fetch(`/api/orders/${orderId}`)

        if (response.ok) {
          const orderData: OrderWithDetails = await response.json()
          console.log('✅ OrderConfirmation: Order data loaded:', orderData.orderId)
          setOrder(orderData)
          // ✅ CAMBIO: Usar nueva función del cart context
          setEstablishmentId(orderData.establishmentId)
        } else {
          console.warn('⚠️ OrderConfirmation: Order not found:', response.status)
          // ✅ ARREGLADO: Usar traducciones en lugar de hardcoding
          setError(t.orderConfirmation.orderNotFound)
          setTimeout(() => {
            // ✅ CAMBIO: URL nueva sin "restaurant"
            router.push(`/${lang}/${establishmentId}/menu`)
          }, 3000)
        }
      } catch (err) {
        console.error('❌ OrderConfirmation: Error fetching order:', err)
        // ✅ ARREGLADO: Usar traducciones
        setError(t.orderConfirmation.failedToLoad)
        setTimeout(() => {
          // ✅ CAMBIO: URL nueva sin "restaurant"
          router.push(`/${lang}/${establishmentId}/menu`)
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    // ✅ CAMBIO: Dependencias actualizadas
  }, [orderId, establishmentId, router, lang, setEstablishmentId, t.orderConfirmation])

  const handleOrderAgain = () => {
    console.log('🔄 OrderConfirmation: Redirecting to menu for establishment:', establishmentId)
    // ✅ CAMBIO: URL nueva sin "restaurant"
    router.push(`/${lang}/${establishmentId}/menu`)
  }

  const getProductName = (item: OrderItemWithDetails): string => {
    const translation = item.variant?.product?.translations?.find((t) => t.languageCode === lang)
    return translation?.name || item.variant?.product?.name || `Product ${item.variantId}`
  }

  const getVariantDescription = (item: OrderItemWithDetails): string | undefined => {
    const translation = item.variant?.translations?.find((t) => t.languageCode === lang)
    return translation?.variantDescription || item.variant?.variantDescription
  }

  // ✅ ARREGLADO: Estado de carga sin fallbacks hardcodeados
  if (loading) {
    return (
      <div className="page-container">
        <div className="order-confirmation-loading">
          <div className="order-confirmation-spinner"></div>
          <p>{t.orderConfirmation.loading}</p>
        </div>
      </div>
    )
  }

  // ✅ ARREGLADO: Estado de error sin fallbacks hardcodeados
  if (error || !order) {
    return (
      <div className="page-container">
        <div className="order-confirmation-error">
          <h1 className="order-confirmation-error-title">
            {error || t.orderConfirmation.orderNotFound}
          </h1>
          <p>{t.orderConfirmation.redirectingToMenu}</p>
          <button
            // ✅ CAMBIO: URL nueva sin "restaurant"
            onClick={() => router.push(`/${lang}/${establishmentId}/menu`)}
            className="btnMinimalista order-confirmation-back-btn"
          >
            {t.orderConfirmation.backToMenu}
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
          {/* ✅ ARREGLADO: Sin fallbacks hardcodeados */}
          <h1 className="order-confirmation-title">{t.orderConfirmation.title}</h1>
          <p className="order-confirmation-subtitle">{t.orderConfirmation.subtitle}</p>
        </div>

        <div className="order-confirmation-card">
          <div className="order-confirmation-card-header">
            {/* ✅ MEJORADO: Usar traducción para "Order" */}
            <h2 className="order-confirmation-order-title">
              {t.orderConfirmation.orderNumber} #{order.orderId}
            </h2>
            {order.tableNumber && (
              <p className="order-confirmation-table">
                {/* ✅ ARREGLADO: Usar traducción */}
                {t.orderConfirmation.tableNumber}: {order.tableNumber}
              </p>
            )}
            <p className="order-confirmation-status">
              {/* ✅ ARREGLADO: Usar traducción para "Status" */}
              {t.orderConfirmation.status}:{' '}
              {t.orderStatus?.[order.status.toLowerCase() as keyof typeof t.orderStatus] ||
                order.status}
            </p>
            <p className="order-confirmation-date">
              {new Date(order.createdAt).toLocaleString(
                lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US'
              )}
            </p>
          </div>

          <div className="order-confirmation-items">
            {/* ✅ ARREGLADO: Eliminar ":" duplicado */}
            <h3 className="order-confirmation-items-title">{t.orderSummary.title}</h3>
            {order.orderItems?.map((item: OrderItemWithDetails, index: number) => (
              <div key={index} className="order-confirmation-item">
                <div className="order-confirmation-item-info">
                  <p className="order-confirmation-item-name">{getProductName(item)}</p>
                  {getVariantDescription(item) && (
                    <p className="order-confirmation-item-variant">{getVariantDescription(item)}</p>
                  )}
                  <p className="order-confirmation-item-quantity">
                    {/* ✅ ARREGLADO: Usar traducción */}
                    {t.orderSummary.quantity}: {item.quantity}
                  </p>
                </div>
                <p className="order-confirmation-item-price">
                  {(Number(item.unitPrice) * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          {order.totalAmount && (
            <div className="order-confirmation-total">
              <div className="order-confirmation-total-row">
                {/* ✅ ARREGLADO: Usar traducción sin fallback */}
                <span className="order-confirmation-total-label">{t.cart.total}:</span>
                <span className="order-confirmation-total-amount">
                  {Number(order.totalAmount).toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="order-confirmation-notes">
              <p>
                {/* ✅ ARREGLADO: Usar traducción sin fallback */}
                <strong>{t.checkout.notes}:</strong> {order.notes}
              </p>
            </div>
          )}
        </div>

        <div className="order-confirmation-actions">
          <button
            onClick={handleOrderAgain}
            className="btnMinimalista order-confirmation-order-again-btn"
          >
            {/* ✅ ARREGLADO: Sin fallback hardcodeado */}
            {t.orderConfirmation.orderAgain}
          </button>
          <button
            onClick={() =>
              // ✅ CAMBIO: URL nueva sin query parameter, solo usar orderId
              router.push(`/${lang}/order/${orderId}/track`)
            }
            className="btnMinimalista order-confirmation-track-btn"
          >
            {/* ✅ ARREGLADO: Sin fallback hardcodeado */}
            {t.orderConfirmation.trackOrder}
          </button>
        </div>
      </div>
    </div>
  )
}
