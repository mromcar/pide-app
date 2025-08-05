import Cart from '@/components/orders/Cart'
import { LanguageCode } from '@/constants/languages'

export default async function CartPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const { lang } = await params // Await params antes de usar sus propiedades

  return (
    <div className="page-container">
      <Cart lang={lang} />
    </div>
  )
}
