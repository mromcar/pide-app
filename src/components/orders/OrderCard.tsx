'use client'

import { OrderStatus } from '@/types/enums'
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
        <h3>Order #{order.orderId}</h3>
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </div>

      <div className="order-details">
        {order.tableNumber && <p>Table: {order.tableNumber}</p>}
        {order.totalAmount && <p>Total: €{order.totalAmount}</p>}
        {order.notes && <p>Notes: {order.notes}</p>}
      </div>

      <div className="order-actions">
        {availableActions.map((action) => (
          <button
            key={action}
            onClick={() => onStatusUpdate(order.orderId, action)}
            className={`action-btn action-${action}`}
          >
            Mark as {action}
          </button>
        ))}
      </div>
    </div>
  )
}
