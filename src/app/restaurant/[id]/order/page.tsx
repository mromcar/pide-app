// src/app/restaurant/[id]/order/page.tsx
'use client' // Necesario para usar hooks de cliente como useParams y Context

import { useParams } from 'next/navigation' // Para obtener el ID del restaurante de la URL
import { OrderProvider } from '@/lib/order-context' // Nuestro proveedor del carrito de compra

// --- Rutas de importación corregidas ---
// ProductList se importa desde su ubicación en la carpeta 'menu'
import { ProductList } from '@/app/restaurant/[id]/menu/components/ProductList'
// OrderForm y CartSummary se importan desde su nueva ubicación dentro de '@/components/order'
import { OrderForm } from '@/components/order/OrderForm'
import { CartSummary } from '@/components/order/CartSummary'
// ------------------------------------

export default function OrderPage() {
  const params = useParams()
  const establishmentId = params.id

  const numericEstablishmentId = establishmentId ? parseInt(establishmentId as string) : null

  if (numericEstablishmentId === null || isNaN(numericEstablishmentId)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-md shadow-md">
        <p className="text-lg font-medium">
          Error: ID de restaurante no válido. Por favor, asegúrese de usar un enlace o QR correcto.
        </p>
      </div>
    )
  }

  return (
    <OrderProvider>
      <div className="container mx-auto p-4 md:flex md:space-x-8">
        {/* Sección de la lista de productos */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Menú del Restaurante
          </h1>
          <ProductList establishmentId={numericEstablishmentId} />
        </div>

        {/* Sección del resumen del carrito y formulario de pedido */}
        <div className="md:w-1/3 mt-8 md:mt-0 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tu Pedido</h2>
          <CartSummary />
          <OrderForm establishmentId={numericEstablishmentId} />
        </div>
      </div>
    </OrderProvider>
  )
}
