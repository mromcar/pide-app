import type { Metadata, Viewport } from 'next'
import { EstablishmentMenuPageProps } from '@/types/pages'
import { getPublicMenuData } from '@/services/api/establishment.api'
import MenuPageClient from '@/components/menu/MenuPageClient'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export async function generateMetadata({ params }: EstablishmentMenuPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { establishmentId: establishmentIdString } = resolvedParams

  const numericEstablishmentId = parseInt(establishmentIdString, 10)
  let establishmentName = ''

  if (!isNaN(numericEstablishmentId)) {
    const menuData = await getPublicMenuData(numericEstablishmentId)
    establishmentName = menuData?.establishment?.name || ''
  }

  return {
    title: establishmentName ? `${establishmentName} - Menu` : 'Restaurant Menu',
  }
}

export default async function MenuPage({ params }: EstablishmentMenuPageProps) {
  const resolvedParams = await params
  const { establishmentId: establishmentIdString, lang } = resolvedParams

  const numericEstablishmentId = parseInt(establishmentIdString, 10)

  if (isNaN(numericEstablishmentId) || numericEstablishmentId <= 0) {
    return (
      <div className="menu-page-error">
        <h1>Invalid restaurant</h1>
        <p>Please check the QR code and try again.</p>
      </div>
    )
  }

  const menuData = await getPublicMenuData(numericEstablishmentId)

  if (!menuData || !menuData.establishment) {
    return (
      <div className="menu-page-error">
        <h1>Restaurant not found</h1>
      </div>
    )
  }

  if (!menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="menu-page-info">
        <h1>{menuData.establishment.name}</h1>
        <p>This restaurant is currently updating their menu.</p>
      </div>
    )
  }

  return (
    <MenuPageClient
      establishment={menuData.establishment}
      categories={menuData.categories}
      allergens={menuData.allergens}
      lang={lang}
    />
  )
}
