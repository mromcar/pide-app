// src/components/order/OrderCard.tsx
'use client'

import React, { useState } from 'react'
import type { SerializedOrder } from '@/types/menu' // Tu tipo de pedido completo
import { OrderStatus, OrderItemStatus } from '@prisma/client' // Enums de Prisma
import { updateOrderStatus } from '@/services/order-service' // Función para actualizar estado (debes crearla)
import { format } from 'date-fns' // Para formatear fechas, si lo tienes instalado
import { es } from 'date-fns/locale' // Para fechas en español

interface OrderCardProps {
  order: SerializedOrder
  onUpdate: () => void // Función para refrescar la lista de pedidos en el componente padre (OrderList)
}

export function OrderCard({ order, onUpdate }: OrderCardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Función para determinar el color de la tarjeta según el estado
  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-50 border-yellow-400'
      case OrderStatus.PREPARING:
        return 'bg-blue-50 border-blue-400'
      case OrderStatus.READY:
        return 'bg-green-50 border-green-400'
      case OrderStatus.DELIVERED:
        return 'bg-purple-50 border-purple-400'
      case OrderStatus.COMPLETED:
        return 'bg-gray-50 border-gray-400'
      case OrderStatus.CANCELLED:
        return 'bg-red-50 border-red-400'
      default:
        return 'bg-white border-gray-300'
    }
  }

  // Función para determinar el color del texto del estado
  const getStatusTextColorClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-700'
      case OrderStatus.PREPARING:
        return 'text-blue-700'
      case OrderStatus.READY:
        return 'text-green-700'
      case OrderStatus.DELIVERED:
        return 'text-purple-700'
      case OrderStatus.COMPLETED:
        return 'text-gray-700'
      case OrderStatus.CANCELLED:
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus
    setIsUpdatingStatus(true)
    setUpdateError(null)

    try {
      // Llama al servicio para actualizar el estado del pedido
      // Necesitarás implementar updateOrderStatus en src/services/orderServices.ts
      await updateOrderStatus(order.order_id, {
        status: newStatus,
        notes: `Estado actualizado a ${newStatus}`,
      })
      onUpdate() // Notifica al padre (OrderList) para que refresque la lista
    } catch (error: any) {
      console.error('Error al actualizar el estado del pedido:', error)
      setUpdateError(error.message || 'Error al actualizar el estado.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 border-l-4 ${getStatusColorClass(order.status)}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Pedido #{order.order_id}</h2>
        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusTextColorClass(order.status)} border ${getStatusColorClass(order.status).replace('bg', 'border')}`}
        >
          {order.status.replace(/_/g, ' ')} {/* Formatear: PENDING -> PENDING */}
        </span>
      </div>

      {order.table_number && (
        <p className="text-gray-700 text-lg mb-2">
          Mesa: <span className="font-semibold">{order.table_number}</span>
        </p>
      )}
      <p className="text-gray-700 mb-2">
        Total: <span className="font-semibold">{order.total_amount.toFixed(2)} €</span>
      </p>
      <p className="text-gray-500 text-sm mb-4">
        Creado: {format(new Date(order.created_at), 'PPPp', { locale: es })}{' '}
        {/* Ej: 1 de enero de 2024, 10:30 PM */}
      </p>
      {order.notes && <p className="text-gray-700 mb-4 italic">Notas: "{order.notes}"</p>}

      <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">
        Detalles de los ítems:
      </h3>
      <ul className="space-y-2 mb-4">
        {order.items.map((item) => (
          <li key={item.order_item_id} className="flex justify-between items-center text-gray-700">
            <span className="flex-grow">
              {item.quantity}x {item.product?.name || 'Producto Desconocido'}
              {item.variant?.variant_description && ` (${item.variant.variant_description})`}
              {item.notes && <span className="text-gray-500 text-sm italic"> ({item.notes})</span>}
            </span>
            <span className="font-semibold">{item.unit_price.toFixed(2)} €</span>
          </li>
        ))}
      </ul>

      {/* Selector de estado para el empleado */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <label
          htmlFor={`status-select-${order.order_id}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cambiar Estado del Pedido:
        </label>
        <select
          id={`status-select-${order.order_id}`}
          value={order.status}
          onChange={handleStatusChange}
          disabled={isUpdatingStatus}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white cursor-pointer"
        >
          {/* Ordena los estados lógicamente para un flujo de trabajo */}
          <option value={OrderStatus.PENDING}>Pendiente</option>
          <option value={OrderStatus.PREPARING}>En Preparación</option>
          <option value={OrderStatus.READY}>Listo para Entregar</option>
          <option value={OrderStatus.DELIVERED}>Entregado</option>
          <option value={OrderStatus.COMPLETED}>Completado</option>
          <option value={OrderStatus.CANCELLED}>Cancelado</option>
        </select>
        {isUpdatingStatus && <p className="mt-2 text-blue-500 text-sm">Actualizando estado...</p>}
        {updateError && <p className="mt-2 text-red-500 text-sm">{updateError}</p>}
      </div>
    </div>
  )
}
