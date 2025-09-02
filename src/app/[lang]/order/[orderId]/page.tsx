import OrderConfirmation from '@/components/orders/OrderConfirmation'
import { getTranslation } from '@/translations'
import { notFound } from 'next/navigation'
// ✅ AÑADIR: Tipos centralizados
import { OrderPageProps } from '@/types/pages'
// ✅ AÑADIR: Helper centralizado sin hardcoding
import { getApiUrl, debugUrls } from '@/lib/api-server'

// ✅ LIMPIADO: Interface movida a types/pages.ts
export default async function OrderPage({ params }: OrderPageProps) {
  const { lang, orderId } = await params
  // ✅ LIMPIADO: Variable 't' no usada en función principal (solo en generateMetadata)

  const orderIdNum = parseInt(orderId)

  if (isNaN(orderIdNum)) {
    console.warn('⚠️ OrderPage: Invalid order ID:', orderId)
    notFound() // ✅ MEJOR: Usar notFound() en lugar de render manual
  }

  // ✅ DEBUG: Solo en desarrollo para ver configuración de URLs
  if (process.env.NODE_ENV === 'development') {
    debugUrls()
  }

  let establishmentId: number

  try {
    console.log('🔍 OrderPage: Fetching order data for ID:', orderIdNum)

    // ✅ ARREGLADO: Sin hardcoding, usando helper centralizado
    const apiUrl = getApiUrl(`/api/orders/${orderIdNum}`)
    console.log('🌐 OrderPage: Using API URL:', apiUrl)

    const response = await fetch(apiUrl, {
      // ✅ MEJORADO: Cache más frecuente para confirmaciones
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn('⚠️ OrderPage: Order not found:', {
        status: response.status,
        statusText: response.statusText,
        orderId: orderIdNum,
        // ✅ Debug info solo en desarrollo
        ...(process.env.NODE_ENV === 'development' && { apiUrl }),
      })
      notFound() // Usar Next.js built-in 404
    }

    const orderData = await response.json()
    establishmentId = orderData.establishmentId

    console.log('✅ OrderPage: Order found, establishmentId:', establishmentId)

    // ✅ MEJORADO: Validación más robusta
    if (!establishmentId || isNaN(establishmentId)) {
      console.error('❌ OrderPage: Invalid establishmentId in order:', {
        orderData,
        establishmentId,
      })
      notFound()
    }
  } catch (error) {
    console.error('❌ OrderPage: Error fetching order:', {
      error: error instanceof Error ? error.message : error,
      orderId: orderIdNum,
      // ✅ URL info solo en desarrollo (no exponer en producción)
      ...(process.env.NODE_ENV === 'development' && {
        attemptedUrl: getApiUrl(`/api/orders/${orderIdNum}`),
      }),
    })
    notFound()
  }

  // ✅ CAMBIO: Pasar establishmentId en lugar de restaurantId
  return <OrderConfirmation lang={lang} orderId={orderIdNum} establishmentId={establishmentId} />
}

// ✅ MEJORADO: Metadata para SEO con tipos correctos
export async function generateMetadata({ params }: OrderPageProps) {
  const { lang, orderId } = await params
  const t = getTranslation(lang) // ✅ CORRECTO: Aquí sí se usa 't'

  return {
    title: `${t.orderConfirmation?.title || 'Order Confirmation'} #${orderId}`,
    description: t.orderConfirmation?.subtitle || 'Your order confirmation details',
    // ✅ AÑADIDO: Más metadata útil
    openGraph: {
      title: `${t.orderConfirmation?.title || 'Order Confirmation'} #${orderId}`,
      description: t.orderConfirmation?.subtitle || 'Your order confirmation details',
    },
  }
}
