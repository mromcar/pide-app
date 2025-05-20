// src/components/order/OrderList.tsx
'use client'

import React from 'react'
import { OrderStatus } from '@prisma/client' // Para el enum de estado

// Definición básica de un tipo de pedido, idealmente coincidirá con el que serializas en tu API
type OrderItem = {
  order_item_id: number
  product?: { name: string } // Asumiendo que el producto viene anidado con un nombre
  variant?: { variant_description?: string } // Asumiendo que la variante viene anidada
  quantity: number
  notes?: string | null
  status: OrderStatus
}

type Order = {
  order_id: number
  table_number?: string | null
  status: OrderStatus
  total_amount: number
  created_at: string // O Date, si lo conviertes en el frontend
  items: OrderItem[]
  // Puedes añadir más campos como client, waiter, etc. si los necesitas mostrar
}

type OrderListProps = {
  orders: Order[]
  onOrderUpdate: () => void // Función para refrescar la lista después de una acción (ej. cambio de estado)
}

export function OrderList({ orders, onOrderUpdate }: OrderListProps) {
  // Función para determinar el color de la tarjeta de pedido según el estado
  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 border-yellow-400'
      case OrderStatus.PREPARING:
        return 'bg-blue-100 border-blue-400'
      case OrderStatus.READY:
        return 'bg-green-100 border-green-400'
      case OrderStatus.DELIVERED:
        return 'bg-purple-100 border-purple-400'
      case OrderStatus.COMPLETED:
        return 'bg-gray-100 border-gray-400'
      case OrderStatus.CANCELLED:
        return 'bg-red-100 border-red-400'
      default:
        return 'bg-white border-gray-300'
    }
  }

  // Función para manejar el cambio de estado de un pedido (requeriría un endpoint PUT/PATCH)
  const handleChangeOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    // Aquí llamarías a tu orderServices.updateOrderStatus(orderId, { status: newStatus })
    // y luego onOrderUpdate() para refrescar la lista.
    console.log(`Cambiando estado del pedido ${orderId} a ${newStatus}`)
    try {
      // await updateOrderStatus(orderId, { status: newStatus }); // Asumiendo que la función existe
      onOrderUpdate() // Refrescar la lista de pedidos
    } catch (error) {
      console.error('Error al actualizar el estado:', error)
      // Mostrar notificación de error
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div
          key={order.order_id}
          className={`bg-white rounded-lg shadow-md border-l-4 ${getStatusColorClass(order.status)} p-6`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pedido #{order.order_id}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === OrderStatus.PENDING
                  ? 'bg-yellow-500 text-white'
                  : order.status === OrderStatus.PREPARING
                    ? 'bg-blue-500 text-white'
                    : order.status === OrderStatus.READY
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          {order.table_number && (
            <p className="text-gray-700 mb-2">
              Mesa: <span className="font-semibold">{order.table_number}</span>
            </p>
          )}
          <p className="text-gray-700 mb-2">
            Total: <span className="font-semibold">{order.total_amount.toFixed(2)} €</span>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Creado: {new Date(order.created_at).toLocaleString()}
          </p>

          <h3 className="text-lg font-semibold mb-2">Detalles del Pedido:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {order.items.map((item) => (
              <li key={item.order_item_id} className="text-sm">
                {item.quantity}x {item.product?.name || 'Producto Desconocido'}
                {item.variant?.variant_description && ` (${item.variant.variant_description})`}
                {item.notes && <span className="text-gray-500 italic"> ({item.notes})</span>}
              </li>
            ))}
          </ul>

          {/* Opciones para cambiar el estado del pedido */}
          <div className="mt-4 border-t pt-4">
            <label
              htmlFor={`status-select-${order.order_id}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cambiar Estado:
            </label>
            <select
              id={`status-select-${order.order_id}`}
              value={order.status}
              onChange={(e) =>
                handleChangeOrderStatus(order.order_id, e.target.value as OrderStatus)
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {/* Aquí puedes controlar qué estados son relevantes para camareros/cocineros */}
              <option value={OrderStatus.PENDING}>Pendiente</option>
              <option value={OrderStatus.PREPARING}>En Preparación</option>
              <option value={OrderStatus.READY}>Listo</option>
              <option value={OrderStatus.DELIVERED}>Entregado</option>
              <option value={OrderStatus.COMPLETED}>Completado</option>
              <option value={OrderStatus.CANCELLED}>Cancelado</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}
