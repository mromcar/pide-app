// src/components/order/OrderRealtimeManager.tsx
'use client' // Mantener como componente de cliente

import { useEffect, useState } from 'react'
import { OrderStatus, SerializedOrder, SerializedOrderItem } from '@/types/menu' // Importa los enums y tipos serializados

// Usar el enum OrderStatus directamente para definir la secuencia de estados
const ORDER_STATUS_SEQUENCE = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED, // COMPLETED y CANCELLED suelen ser estados finales
  OrderStatus.CANCELLED,
]

function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(currentStatus)
  // Solo avanza si no es uno de los dos últimos estados finales (COMPLETED o CANCELLED)
  return idx >= 0 && idx < ORDER_STATUS_SEQUENCE.length - 2 ? ORDER_STATUS_SEQUENCE[idx + 1] : null
}

export default function OrderRealtimeManager() {
  // <--- ¡CAMBIO CLAVE AQUÍ! Renombrado el componente
  const [orders, setOrders] = useState<SerializedOrder[]>([]) // Usar el tipo SerializedOrder

  const fetchOrders = async () => {
    // CONSIDERACIÓN: Renombra este endpoint en tu API a '/api/orders' para coherencia
    const res = await fetch('/api/pedidos')
    if (!res.ok) {
      console.error('Failed to fetch orders')
      setOrders([])
      return
    }
    const data = await res.json()
    // Asumimos que data.pedidos es un array de SerializedOrder.
    // Si tu API devuelve 'orders', cambia 'data.pedidos' a 'data.orders'.
    setOrders(data.pedidos || [])
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000) // Refresca cada 5 segundos
    return () => clearInterval(interval) // Limpia el intervalo al desmontar el componente
  }, [])

  const changeOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      // CONSIDERACIÓN: Renombra este endpoint en tu API a '/api/orders'
      const res = await fetch('/api/pedidos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Asegúrate de que los nombres de los campos coincidan con lo que espera tu API
        // (order_id y status son los que hemos estandarizado)
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      })

      if (!res.ok) {
        console.error('Failed to update order status')
        // Opcional: mostrar un mensaje de error al usuario
      }
    } catch (error) {
      console.error('Error changing order status:', error)
    } finally {
      fetchOrders() // Siempre refresca la lista de pedidos después de intentar un cambio
    }
  }

  return (
    <ul className="space-y-4">
      {' '}
      {/* Añadir un poco de espacio entre pedidos */}
      {orders.map((order) => (
        <li key={order.order_id} className="mb-4 border-b pb-2 bg-white shadow-sm rounded-md p-4">
          <div className="flex justify-between items-center mb-2">
            <b className="text-xl text-gray-800">Order #{order.order_id}</b>
            <b className="text-lg text-blue-600">Status: {order.status}</b>
          </div>
          <div className="text-gray-700">
            {Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item: SerializedOrderItem) => (
                // Acceder a la variante y el producto serializados
                <div key={item.order_item_id} className="text-sm">
                  {item.quantity} x {item.variant?.product?.name || 'Unknown Product'}{' '}
                  {/* Manejar posibles undefineds */}
                  {item.notes && <span className="italic ml-2 text-gray-500">({item.notes})</span>}
                </div>
              ))
            ) : (
              <div className="text-gray-400 italic">No items in this order.</div>
            )}
          </div>
          <div className="mt-4 flex space-x-2">
            {' '}
            {/* Espacio entre botones */}
            {getNextStatus(order.status) && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                onClick={() => changeOrderStatus(order.order_id, getNextStatus(order.status)!)}
              >
                Mark as {getNextStatus(order.status)}
              </button>
            )}
            {order.status !== OrderStatus.CANCELLED && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-2 transition duration-300 ease-in-out"
                onClick={() => changeOrderStatus(order.order_id, OrderStatus.CANCELLED)}
              >
                Cancel
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
