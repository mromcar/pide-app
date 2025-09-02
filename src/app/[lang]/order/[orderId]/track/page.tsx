import OrderTracking from '@/components/orders/OrderTracking'
import { getTranslation } from '@/translations'
import { notFound } from 'next/navigation'
import { OrderTrackPageProps } from '@/types/pages'
// ✅ AÑADIR: Import del helper centralizado
import { getApiUrl, debugUrls } from '@/lib/api-server'

// ✅ LIMPIO: Sin interfaces inline, solo lógica de la página
export default async function OrderTrackPage({ params }: OrderTrackPageProps) {
  const { lang, orderId } = await params

  const orderIdNum = parseInt(orderId)

  if (isNaN(orderIdNum) || orderIdNum <= 0) {
    console.warn('⚠️ OrderTrackPage: Invalid order ID:', orderId)
    notFound()
  }

  // ✅ DEBUG: Solo en desarrollo para ver configuración de URLs
  if (process.env.NODE_ENV === 'development') {
    debugUrls()
  }

  let establishmentId: number

  try {
    console.log('🔍 OrderTrackPage: Fetching order data for tracking:', orderIdNum)

    // ✅ ARREGLADO: Sin hardcoding, usando helper centralizado
    const apiUrl = getApiUrl(`/api/orders/${orderIdNum}`)
    console.log('🌐 OrderTrackPage: Using API URL:', apiUrl)

    const response = await fetch(apiUrl, {
      next: { revalidate: 30 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn('⚠️ OrderTrackPage: Order not found:', {
        status: response.status,
        statusText: response.statusText,
        orderId: orderIdNum,
        // ✅ Debug info solo en desarrollo
        ...(process.env.NODE_ENV === 'development' && { apiUrl }),
      })
      notFound()
    }

    const orderData = await response.json()
    establishmentId = orderData.establishmentId

    console.log('✅ OrderTrackPage: Order found for tracking:', {
      orderId: orderIdNum,
      establishmentId,
      status: orderData.status,
    })

    if (!establishmentId || isNaN(establishmentId)) {
      console.error('❌ OrderTrackPage: Invalid establishmentId in order:', {
        orderData,
        establishmentId,
      })
      notFound()
    }
  } catch (error) {
    console.error('❌ OrderTrackPage: Error fetching order for tracking:', {
      error: error instanceof Error ? error.message : error,
      orderId: orderIdNum,
      // ✅ URL info solo en desarrollo (no exponer en producción)
      ...(process.env.NODE_ENV === 'development' && {
        attemptedUrl: getApiUrl(`/api/orders/${orderIdNum}`),
      }),
    })
    notFound()
  }

  return <OrderTracking lang={lang} orderId={orderIdNum} establishmentId={establishmentId} />
}

export async function generateMetadata({ params }: OrderTrackPageProps) {
  const { lang, orderId } = await params
  const t = getTranslation(lang)

  return {
    title: `${t.orderConfirmation?.trackOrder || 'Track Order'} #${orderId}`,
    description: t.orderConfirmation?.subtitle || 'Track your order status in real-time',
    refresh: 60,
  }
}

export function generateStaticParams() {
  return []
}
