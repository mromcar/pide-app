// src/hooks/useEstablishmentOrders.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/services/order.service';
import { useSession } from 'next-auth/react';
import { OrderStatus } from '@prisma/client';
import { Order } from '@/types/entities/order';

export type OrderFilters = {
  status?: OrderStatus | 'ALL';
  orderType?: string | 'ALL';
};

const orderService = new OrderService();

export function useEstablishmentOrders(initialFilters: OrderFilters = { status: OrderStatus.pending, orderType: 'ALL' }) {
  const { data: session, status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const [refreshing, setRefreshing] = useState(false);

  // Función para obtener las órdenes del establecimiento
  const fetchOrders = useCallback(async () => {
    if (sessionStatus === 'loading' || !session?.user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener el establecimiento del usuario desde la sesión
      const establishmentId = session.user.establishmentId;
      
      if (!establishmentId) {
        throw new Error('No se encontró el establecimiento del usuario');
      }

      // Llamar al servicio para obtener las órdenes
      const fetchedOrders = await orderService.getOrdersByEstablishment(establishmentId);
      
      // Aplicar filtros
      let filteredOrders = fetchedOrders;
      
      if (filters.status && filters.status !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      
      if (filters.orderType && filters.orderType !== 'ALL') {
        filteredOrders = filteredOrders.filter(order => order.order_type === filters.orderType);
      }

      setOrders(filteredOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus, filters]);

  // Función para actualizar el estado de una orden
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    try {
      setRefreshing(true);
      await orderService.updateOrderStatus(orderId, newStatus, notes);
      
      // Actualizar la orden en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado de la orden');
      return false;
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Función para refrescar las órdenes
  const refreshOrders = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para obtener órdenes por estado
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Función para obtener estadísticas de órdenes
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === OrderStatus.pending).length,
      preparing: orders.filter(order => order.status === OrderStatus.preparing).length,
      ready: orders.filter(order => order.status === OrderStatus.ready).length,
      delivered: orders.filter(order => order.status === OrderStatus.delivered).length,
      cancelled: orders.filter(order => order.status === OrderStatus.cancelled).length,
      completed: orders.filter(order => order.status === OrderStatus.completed).length,
    };
    return stats;
  }, [orders]);

  // Efecto para cargar las órdenes cuando cambian los filtros o la sesión
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchOrders();
    }
  }, [fetchOrders, sessionStatus]);

  // Efecto para configurar actualización automática cada 30 segundos
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [fetchOrders, sessionStatus]);

  return {
    // Estados
    orders,
    loading,
    error,
    filters,
    refreshing,
    
    // Funciones
    fetchOrders,
    updateOrderStatus,
    refreshOrders,
    updateFilters,
    getOrdersByStatus,
    getOrderStats,
    
    // Estados derivados
    hasOrders: orders.length > 0,
    isAuthenticated: sessionStatus === 'authenticated',
  };
}