'use client'

import { OrderStatus } from '@/types/enums' // ✅ Cambiar importación a types/enums
import { OrderResponseDTO } from '@/types/dtos/order'

interface OrderCardProps {
  order: OrderResponseDTO
  availableActions: OrderStatus[]
  onStatusUpdate: (orderId: number, newStatus: OrderStatus) => void
}

export default function OrderCard({ order, availableActions, onStatusUpdate }: OrderCardProps) {
  return (
    <div className="order-card">
      <div className="order-header">
        <h3>Order #{order.order_id}</h3>
        <span className={`status-badge status-${order.status}`}>
          {order.status}
        </span>
      </div>
      
      <div className="order-details">
        {order.table_number && (
          <p>Table: {order.table_number}</p>
        )}
        {order.total_amount && (
          <p>Total: €{order.total_amount}</p>
        )}
        {order.notes && (
          <p>Notes: {order.notes}</p>
        )}
      </div>

      <div className="order-actions">
        {availableActions.map(action => (
          <button
            key={action}
            onClick={() => onStatusUpdate(order.order_id, action)}
            className={`action-btn action-${action}`}
          >
            Mark as {action}
          </button>
        ))}
      </div>
    </div>
  )
}