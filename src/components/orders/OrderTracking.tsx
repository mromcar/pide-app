'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface OrderTrackingProps {
  lang: LanguageCode
  orderId: number // ✅ CAMBIO: string → number (más consistente)
  establishmentId: number // ✅ CAMBIO: restaurantId → establishmentId
}

type OrderTrackingOrder = {
  orderId: number
  status: string
  tableNumber?: string
  // ✅ AÑADIDO: Más campos útiles
  createdAt?: string
  estimatedTime?: number
}

// ✅ CAMBIO 2: Parámetros actualizados
export default function OrderTracking({ lang, orderId, establishmentId }: OrderTrackingProps) {
  const [order, setOrder] = useState<OrderTrackingOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // ✅ AÑADIDO: Estado de error
  const router = useRouter()
  const t = getTranslation(lang)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('🔍 OrderTracking: Fetching order status:', orderId)
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const orderData = await response.json()
          console.log('✅ OrderTracking: Order status loaded:', orderData.status)
          setOrder(orderData)
          setError(null) // ✅ AÑADIDO: Limpiar error en éxito
        } else {
          console.warn('⚠️ OrderTracking: Order not found:', response.status)
          // ✅ ARREGLADO: Usar traducciones
          setError(t.orderConfirmation.orderNotFound)
        }
      } catch (err) {
        console.error('❌ OrderTracking: Error fetching order:', err)
        // ✅ ARREGLADO: Usar traducciones
        setError(t.orderConfirmation.failedToLoad)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 30000) // Poll cada 30 segundos
    return () => clearInterval(interval)

    // ✅ CAMBIO 3: Dependencias actualizadas
  }, [orderId, establishmentId, t.orderConfirmation])

  const getStatusSteps = () => {
    const steps = [
      { key: 'PENDING', label: t.orderStatus.pending }, // ✅ CAMBIO: Usar uppercase para consistencia
      { key: 'CONFIRMED', label: t.orderStatus.confirmed },
      { key: 'PREPARING', label: t.orderStatus.preparing },
      { key: 'READY', label: t.orderStatus.ready },
      { key: 'DELIVERED', label: t.orderStatus.delivered },
    ]

    // ✅ MEJORADO: Manejar status en mayúsculas/minúsculas
    const orderStatus = order?.status?.toUpperCase()
    const currentIndex = steps.findIndex((step) => step.key === orderStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  // ✅ ARREGLADO: Estado de carga sin hardcoding
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[16rem]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        {/* ✅ AÑADIDO: Texto de carga traducido */}
        <p className="ml-4">{t.orderConfirmation.loading}</p>
      </div>
    )
  }

  // ✅ ARREGLADO: Estado de error sin hardcoding
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[16rem]">
        {/* ✅ ARREGLADO: Usar traducciones */}
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || t.orderConfirmation.orderNotFound}
        </h1>
        <button
          // ✅ CAMBIO 4: URL actualizada sin "restaurant"
          onClick={() => router.push(`/${lang}/${establishmentId}/menu`)}
          className="btnMinimalista px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {t.orderConfirmation.backToMenu}
        </button>
      </div>
    )
  }

  const statusSteps = getStatusSteps()

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* ✅ ARREGLADO: Título sin hardcoding */}
      <h1 className="text-2xl font-bold mb-6">{t.orderConfirmation.trackOrder}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          {/* ✅ ARREGLADO: "Pedido" traducible */}
          <h2 className="text-lg font-semibold mb-2">
            {t.orderConfirmation.orderNumber} #{order.orderId}
          </h2>
          {/* ✅ ARREGLADO: "Mesa" traducible */}
          {order.tableNumber && (
            <p className="text-gray-600">
              {t.orderConfirmation.tableNumber}: {order.tableNumber}
            </p>
          )}
          {/* ✅ AÑADIDO: Mostrar fecha de creación */}
          {order.createdAt && (
            <p className="text-gray-600 text-sm mt-1">
              {new Date(order.createdAt).toLocaleString(
                lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US'
              )}
            </p>
          )}
        </div>

        {/* ✅ MEJORADO: Progress Steps con mejor UX */}
        <div className="space-y-4">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors
                  ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                        ? 'bg-blue-500 text-white animate-pulse' // ✅ AÑADIDO: Animación para estado actual
                        : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p
                className={`font-medium transition-colors
                  ${
                    step.current
                      ? 'text-blue-600 font-bold' // ✅ MEJORADO: Más énfasis en estado actual
                      : step.completed
                        ? 'text-green-600'
                        : 'text-gray-500'
                  }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ AÑADIDO: Tiempo estimado si está disponible */}
        {order.estimatedTime && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              ⏱️ {t.orderConfirmation.estimatedTime}: {order.estimatedTime} min
            </p>
          </div>
        )}
      </div>

      {/* ✅ MEJORADO: Botón más grande y claro */}
      <button
        // ✅ CAMBIO 5: URL actualizada sin "restaurant"
        onClick={() => router.push(`/${lang}/${establishmentId}/menu`)}
        className="btnMinimalista w-full py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
      >
        {t.orderConfirmation.backToMenu}
      </button>
    </div>
  )
}
