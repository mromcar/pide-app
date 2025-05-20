// src/app/restaurant/[id]/order/page.tsx
'use client' // Necesario para usar hooks de cliente como useParams y Context

import { useParams } from 'next/navigation' // Para obtener el ID del restaurante de la URL
import { OrderProvider } from '@/lib/order-context' // Nuestro proveedor del carrito de compra
import { ProductList } from '@/components/product/ProductList' // Componente para mostrar los productos
import { OrderForm } from '@/components/order/OrderForm' // Componente para el formulario de pedido
import { CartSummary } from '@/components/order/CartSummary' // Un nuevo componente para mostrar el resumen del carrito

export default function OrderPage() {
  const params = useParams()
  // El ID del restaurante viene de la URL, por ejemplo, de /restaurant/123/order
  // Asegúrate de que 'id' coincida con el nombre de tu carpeta dinámica [id]
  const establishmentId = params.id

  // Convertir el ID a número si es necesario (para pasarlo a funciones o APIs que lo esperan numérico)
  const numericEstablishmentId = establishmentId ? parseInt(establishmentId as string) : null

  if (numericEstablishmentId === null || isNaN(numericEstablishmentId)) {
    // Manejar el caso donde el ID del restaurante no es válido o no está presente
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        ID de restaurante no válido. Por favor, escanee el QR correcto.
      </div>
    )
  }

  return (
    // Envuelve toda la página con el OrderProvider para que ProductList y OrderForm
    // puedan acceder al contexto del carrito
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
          <CartSummary /> {/* Muestra los ítems del carrito y el total */}
          <OrderForm establishmentId={numericEstablishmentId} />{' '}
          {/* Permite al cliente finalizar el pedido */}
        </div>
      </div>
    </OrderProvider>
  )
}
