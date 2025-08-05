import OrderConfirmation from '@/components/orders/OrderConfirmation'
import { LanguageCode } from '@/constants/languages'

interface OrderPageProps {
  params: Promise<{
    lang: LanguageCode
    orderId: string
  }>
  searchParams: Promise<{
    restaurantId?: string
  }>
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { lang, orderId } = await params
  const { restaurantId } = await searchParams

  const orderIdNum = parseInt(orderId)
  const restaurantIdNum = restaurantId ? parseInt(restaurantId) : 1

  if (isNaN(orderIdNum)) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Order ID</h1>
        </div>
      </div>
    )
  }

  return <OrderConfirmation lang={lang} orderId={orderIdNum} restaurantId={restaurantIdNum} />
}
