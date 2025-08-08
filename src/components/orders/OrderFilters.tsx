'use client'

import { OrderStatus, UserRole } from '@prisma/client'

interface OrderFiltersProps {
  statusFilter: OrderStatus | 'all'
  onStatusFilterChange: (status: OrderStatus | 'all') => void
  userRole: UserRole
}

export default function OrderFilters({
  statusFilter,
  onStatusFilterChange,
  userRole,
}: OrderFiltersProps) {
  const getAvailableStatuses = () => {
    if (userRole === UserRole.cook) {
      return [OrderStatus.pending, OrderStatus.preparing]
    } else if (userRole === UserRole.waiter) {
      return [OrderStatus.ready, OrderStatus.delivered]
    }
    return Object.values(OrderStatus)
  }

  return (
    <div className="orderFilters">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | 'all')}
        className="filterSelect"
      >
        <option value="all">All Orders</option>
        {getAvailableStatuses().map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}
