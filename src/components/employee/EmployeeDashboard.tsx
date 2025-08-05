'use client'
import { useState, useEffect } from 'react'
import { OrderStatus, UserRole } from '@/types/enums'
import { OrderResponseDTO } from '@/types/dtos/order'
import OrderFilters from './OrderFilters'
import OrderCard from './OrderCard'

interface EmployeeDashboardProps {
  establishmentId: number
  userRole: UserRole
  userId: number
}

export default function EmployeeDashboard({
  establishmentId,
  userRole,
  userId,
}: EmployeeDashboardProps) {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/establishments/${establishmentId}/orders/employee`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus, notes?: string) => {
    try {
      const response = await fetch(
        `/api/establishments/${establishmentId}/orders/employee/${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus, notes }),
        }
      )

      if (response.ok) {
        await fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [establishmentId])

  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by role responsibility
    if (userRole === UserRole.COOK) {
      // Cooks see orders that need preparation
      filtered = filtered.filter(
        (order) => order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING
      )
    } else if (userRole === UserRole.WAITER) {
      // Waiters see orders ready for delivery or that need table service
      filtered = filtered.filter(
        (order) => order.status === OrderStatus.READY || order.status === OrderStatus.DELIVERED
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, userRole])

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getFilteredOrders = () => {
    let filtered = [...orders]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by role responsibility
    if (userRole === UserRole.COOK) {
      // Cooks see orders that need preparation
      filtered = filtered.filter(
        (order) => order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING
      )
    } else if (userRole === UserRole.WAITER) {
      // Waiters see orders ready for delivery or that need table service
      filtered = filtered.filter(
        (order) => order.status === OrderStatus.READY || order.status === OrderStatus.DELIVERED
      )
    }

    setFilteredOrders(filtered)
  }

  const getAvailableActions = (status: OrderStatus) => {
    const actions: Array<{ status: OrderStatus; label: string; color: string }> = []

    if (userRole === UserRole.COOK) {
      if (currentStatus === OrderStatus.PENDING) {
        actions.push({
          status: OrderStatus.PREPARING,
          label: 'Start Preparing',
          color: 'bg-yellow-500',
        })
      }
      if (currentStatus === OrderStatus.PREPARING) {
        actions.push({ status: OrderStatus.READY, label: 'Mark Ready', color: 'bg-green-500' })
      }
    } else if (userRole === UserRole.WAITER) {
      if (currentStatus === OrderStatus.READY) {
        actions.push({
          status: OrderStatus.DELIVERED,
          label: 'Mark Delivered',
          color: 'bg-blue-500',
        })
      }
    }

    return actions.map(action => ({
      ...action,
      status: action.status as OrderStatus // ✅ Cast explícito
    }))
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="employee-dashboard-main">
      <div className="employee-dashboard-header-section">
        <div className="employee-dashboard-header-wrapper">
          <div className="employee-dashboard-header-content">
            <h1 className="employee-dashboard-main-title">
              {userRole === UserRole.COOK ? 'Kitchen Dashboard' : 'Waiter Dashboard'}
            </h1>
            <p className="employee-dashboard-description">
              {userRole === UserRole.COOK
                ? 'Manage food preparation and cooking orders'
                : 'Manage table service and order delivery'}
            </p>
          </div>
        </div>
      </div>

      <div className="employee-dashboard-content">
        <OrderFilters
          statusFilter={statusFilter}
          onStatusFilterChange={(status: OrderStatus | 'all') => setStatusFilter(status)}
          userRole={userRole}
        />

        <div className="employee-dashboard-orders-grid">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              availableActions={getAvailableActions(order.status).map((action) => action.status as OrderStatus)}
              onStatusUpdate={(orderId: number, newStatus: OrderStatus) =>
                handleStatusUpdate(orderId, newStatus as any)
              }
            />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="employee-dashboard-empty">
            <p className="employee-dashboard-empty-text">No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
