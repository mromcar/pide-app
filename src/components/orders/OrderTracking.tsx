'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface OrderTrackingProps {
  lang: LanguageCode
  orderId: string
  restaurantId: string
}

type OrderTrackingOrder = {
  orderId: number
  status: string
  tableNumber?: string
}

export default function OrderTracking({ lang, orderId, restaurantId }: OrderTrackingProps) {
  const [order, setOrder] = useState<OrderTrackingOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const t = getTranslation(lang)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [orderId, restaurantId])

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: t.orderStatus.pending },
      { key: 'confirmed', label: t.orderStatus.confirmed },
      { key: 'preparing', label: t.orderStatus.preparing },
      { key: 'ready', label: t.orderStatus.ready },
      { key: 'delivered', label: t.orderStatus.delivered },
    ]

    const currentIndex = steps.findIndex((step) => step.key === order?.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[16rem]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[16rem]">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Order not found</h1>
        <button
          onClick={() => router.push(`/${lang}/restaurant/${restaurantId}/menu`)}
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
      <h1 className="text-2xl font-bold mb-6">{t.orderConfirmation.trackOrder}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Pedido #{order.orderId}</h2>
          {order.tableNumber && <p className="text-gray-600">Mesa: {order.tableNumber}</p>}
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-4
                  ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                        ? 'bg-blue-500 text-white'
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
                className={`font-medium
                  ${
                    step.current
                      ? 'text-blue-600'
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
      </div>

      <button
        onClick={() => router.push(`/${lang}/restaurant/${restaurantId}/menu`)}
        className="btnMinimalista w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        {t.orderConfirmation.backToMenu}
      </button>
    </div>
  )
}
