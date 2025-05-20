// src/app/dashboard/orders/page.tsx
'use client'
import { useOrders } from '@/hooks/useOrders' // Tu hook personalizado
import { OrderList } from '@/components/order/OrderList'
import { OrderFilters } from '@/components/order/OrderFilters' // Tu componente de filtros

export default function OrdersPage() {
  // Ahora useOrders devuelve también los filtros actuales y una función para actualizarlos
  const { orders, loading, error, filters, updateFilters, refreshOrders } = useOrders()

  // Manejo de estados de carga y error (se puede mejorar la UI)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p className="text-xl">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Panel de Pedidos</h1>
      <OrderFilters currentFilters={filters} onFiltersChange={updateFilters} />
      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          No hay pedidos que coincidan con los filtros actuales.
        </div>
      ) : (
        <OrderList orders={orders} onOrderUpdate={refreshOrders} /> {/* onOrderUpdate para refrescar la lista si un pedido se actualiza */}
      )}
    </div>
  )
}
