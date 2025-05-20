// src/components/order/OrderList.tsx
'use client'

import React from 'react'
import { OrderCard } from './OrderCard' // Asume que OrderCard es un componente individual
import type { SerializedOrder } from '@/types/menu' // Asegúrate de que este tipo sea correcto
import { OrderStatus } from '@prisma/client' // Para el enum de estados, si es necesario aquí

interface OrderListProps {
  orders: SerializedOrder[] // Tu tipo de pedido completo que viene de la API de empleados
  onOrderUpdate: () => void // Callback para refrescar la lista después de una acción (ej. cambio de estado de un pedido)
}

export function OrderList({ orders, onOrderUpdate }: OrderListProps) {
  if (!orders || orders.length === 0) {
    return <div className="text-center py-10 text-gray-600">No hay pedidos para mostrar.</div>
  }

  return (
    <div className="space-y-6">
      {' '}
      {/* Espaciado entre las tarjetas de pedido */}
      {orders.map((order) => (
        <OrderCard key={order.order_id} order={order} onUpdate={onOrderUpdate} />
      ))}
    </div>
  )
}
