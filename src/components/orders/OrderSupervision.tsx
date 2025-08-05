'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Order } from '@/types/entities/order'
import { OrderStatus } from '@/types/enums'
import type { LanguageCode } from '@/constants/languages'
import { OrderResponseDTO } from '@/types/dtos/order'

interface OrderSupervisionProps {
  establishmentId: string
  language: LanguageCode
}

// Definir el flujo de estados
const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.READY,
  [OrderStatus.READY]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null,
  [OrderStatus.CANCELLED]: null,
} as const

function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  return statusFlow[currentStatus]
}

export function OrderSupervision({ establishmentId, language }: OrderSupervisionProps) {
  const { t } = useTranslation(language)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchOrders()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [establishmentId, selectedStatus, selectedDate])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
      })

      const response = await fetch(`/api/establishments/${establishmentId}/orders?${params}`)

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (order_id: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${order_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getOrdersByStatus = () => {
    const statusGroups = {
      pending: orders.filter((o) => o.status === OrderStatus.PENDING),
      confirmed: orders.filter((o) => o.status === OrderStatus.PENDING),
      preparing: orders.filter((o) => o.status === OrderStatus.PREPARING),
      ready: orders.filter((o) => o.status === OrderStatus.READY),
      delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED),
      cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED),
      completed: orders.filter((o) => o.status === OrderStatus.COMPLETED),
    }
    return statusGroups
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    )
  }

  const ordersByStatus = getOrdersByStatus()

  return (
    <div className="order-supervision">
      {/* Header with Filters */}
      <div className="supervision-header">
        <div className="header-controls">
          <div className="filter-group">
            <label className="filter-label">
              {t.establishmentAdmin.orderSupervision.filters.date}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              {t.establishmentAdmin.orderSupervision.filters.status}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
              className="filter-select"
            >
              <option value="all">
                {t.establishmentAdmin.orderSupervision.filters.allStatuses}
              </option>
              <option value="pending">{t.orderStatus.pending}</option>
              <option value="confirmed">{t.orderStatus.confirmed}</option>
              <option value="preparing">{t.orderStatus.preparing}</option>
              <option value="ready">{t.orderStatus.ready}</option>
              <option value="delivered">{t.orderStatus.delivered}</option>
              <option value="cancelled">{t.orderStatus.cancelled}</option>
              <option value="completed">{t.orderStatus.completed}</option>
            </select>
          </div>

          <button onClick={fetchOrders} className="btn-secondary">
            {t.establishmentAdmin.orderSupervision.refresh}
          </button>
        </div>

        {/* Statistics */}
        <div className="order-stats">
          <div className="stat-card">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">
              {t.establishmentAdmin.orderSupervision.stats.totalOrders}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {ordersByStatus.pending.length +
                ordersByStatus.confirmed.length +
                ordersByStatus.preparing.length}
            </span>
            <span className="stat-label">
              {t.establishmentAdmin.orderSupervision.stats.activeOrders}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{ordersByStatus.completed.length}</span>
            <span className="stat-label">
              {t.establishmentAdmin.orderSupervision.stats.completedOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Kanban Board */}
      <div className="orders-kanban">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
          <div key={status} className="kanban-column">
            <div className="column-header">
              <h3 className="column-title">{t.orderStatus[status as OrderStatus]}</h3>
              <span className="order-count">{statusOrders.length}</span>
            </div>

            <div className="column-content">
              {statusOrders.map((order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  t={t}
                />
              ))}

              {statusOrders.length === 0 && (
                <div className="empty-column">
                  <p className="text-gray-500 text-sm">
                    {t.establishmentAdmin.orderSupervision.noOrdersInStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Order Card Component
interface OrderCardProps {
  order: Order
  onStatusUpdate: (order_id: string, status: OrderStatus) => void
  t: any
}

function OrderCard({ order, onStatusUpdate, t }: OrderCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const nextStatus = getNextStatus(order.status as OrderStatus)

  return (
    <div className="order-card">
      <div className="card-header">
        <div className="order-info">
          <span className="order-number">#{order.order_id}</span>
          <span className="order-time">{new Date(order.created_at).toLocaleTimeString()}</span>
        </div>
        <span className="table-number">
          {t.checkout.tableNumber}: {order.table_number}
        </span>
      </div>

      <div className="card-content">
        <div className="order-items">
          {order.items?.slice(0, 2).map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-quantity">{item.quantity}x</span>
              <span className="item-name">{item.product?.name}</span>
            </div>
          ))}
          {order.items && order.items.length > 2 && (
            <div className="more-items">+{order.items.length - 2} more items</div>
          )}
        </div>

        <div className="order-total">
          <span className="total-label">{t.total}:</span>
          <span className="total-amount">${order.total_amount?.toFixed(2)}</span>
        </div>
      </div>

      <div className="card-actions">
        {nextStatus && (
          <button
            onClick={() => onStatusUpdate(order.order_id.toString(), nextStatus)}
            className="btn-primary btn-sm"
          >
            {t.establishmentAdmin.orderSupervision.markAs} {t.orderStatus[nextStatus]}
          </button>
        )}

        <button onClick={() => setShowDetails(!showDetails)} className="btn-secondary btn-sm">
          {showDetails ? t.establishmentAdmin.orderSupervision.hideDetails : t.viewDetails}
        </button>

        {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
          <button
            onClick={() => onStatusUpdate(order.order_id.toString(), OrderStatus.CANCELLED)}
            className="btn-danger btn-sm"
          >
            {t.cancelOrder}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="order-details">
          <div className="details-section">
            <h4>{t.orderSummary.title}</h4>
            {order.items?.map((item, index) => (
              <div key={index} className="detail-item">
                <span>
                  {item.quantity}x {item.product?.name}
                </span>
                <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="details-section">
              <h4>{t.notes}</h4>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
