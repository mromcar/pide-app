import OrderTracking from '@/components/orders/OrderTracking'
import { LanguageCode } from '@/constants/languages'

interface OrderTrackPageProps {
  params: Promise<{
    lang: LanguageCode
    orderId: string
  }>
  searchParams: Promise<{
    restaurantId?: string
  }>
}

export default async function OrderTrackPage({ params, searchParams }: OrderTrackPageProps) {
  const { lang, orderId } = await params
  const { restaurantId } = await searchParams

  const orderIdNum = parseInt(orderId)
  const restaurantIdNum = restaurantId ? parseInt(restaurantId) : 1

  return <OrderTracking 
    lang={lang} 
    orderId={orderIdNum.toString()} 
    restaurantId={restaurantIdNum.toString()} 
  />
}
