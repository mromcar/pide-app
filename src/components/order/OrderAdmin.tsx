// src/components/order/OrderAdmin.tsx
'use client' // Asegúrate de que el componente sigue siendo de cliente

import { useEffect, useState } from 'react'
import { OrderStatus } from '@/types/menu' // ¡IMPORTANTE! Asegúrate de importar OrderStatus desde tu archivo de tipos

export default function OrderAdmin() {
  // <--- ¡CAMBIO CLAVE AQUÍ! Renombrado a OrderAdmin
  const [orders, setOrders] = useState([]) // Renombrado de 'pedidos' a 'orders'
  const [statusFilter, setStatusFilter] = useState('') // Renombrado de 'estado' a 'statusFilter'

  useEffect(() => {
    const fetchOrders = async () => {
      // Renombrado de 'fetchPedidos' a 'fetchOrders'
      let url = '/api/pedidos' // CONSIDERACIÓN: Renombra este endpoint en tu API a '/api/orders' para coherencia
      if (statusFilter) url += `?estado=${statusFilter}` // CONSIDERACIÓN: Cambia 'estado' a 'status' en la URL
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.pedidos || []) // CONSIDERACIÓN: Aquí 'data.pedidos' debería ser 'data.orders' si tu API lo devuelve así
    }
    fetchOrders()
  }, [statusFilter])

  return (
    <div>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        {/* Usando los valores del enum OrderStatus para consistencia */}
        <option value="">All except COMPLETED</option>{' '}
        {/* Considera traducir este texto a inglés también */}
        <option value={OrderStatus.PENDING}>Pending</option>
        <option value={OrderStatus.PREPARING}>Preparing</option>
        <option value={OrderStatus.READY}>Ready</option>
        <option value={OrderStatus.DELIVERED}>Delivered</option>
        <option value={OrderStatus.CANCELLED}>Cancelled</option>
        <option value={OrderStatus.COMPLETED}>Completed</option>
      </select>
      <ul>
        {orders.map(
          (
            order: any // Renombrado de 'pedido' a 'order'
          ) => (
            <li key={order.id_pedido}>
              {' '}
              {/* Consideración: Renombra 'id_pedido' a 'order_id' si es posible */}
              Order #{order.id_pedido} - Status: {order.estado}{' '}
              {/* Consideración: Renombra 'estado' a 'status' si es posible */}
            </li>
          )
        )}
      </ul>
    </div>
  )
}
