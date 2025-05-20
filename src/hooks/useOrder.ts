// src/hooks/useOrders.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchEmployeeOrders } from '@/services/orderServices'; // Importa tu función de servicio
import { useSession } from 'next-auth/react'; // Para obtener la sesión del empleado
import { OrderStatus } from '@prisma/client'; // Para los estados de los pedidos si los necesitas

// Definición de los filtros que este hook puede aceptar
export type OrderFilters = {
  status?: OrderStatus | 'ALL'; // Opcional: filtrar por estado (PENDING, PREPARING, etc. o 'ALL' para todos)
  orderType?: string | 'ALL'; // Opcional: filtrar por tipo de pedido (COCINA, BAR, etc. o 'ALL' para todos)
  // Puedes añadir más filtros aquí: fecha, número de mesa, etc.
};

export function useOrders(initialFilters: OrderFilters = { status: 'PENDING', orderType: 'ALL' }) {
  const { data: session, status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<any[]>([]); // Usa el tipo de Order que retornas de tu API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);

  // Función para obtener los pedidos, memoizada para evitar re-creación innecesaria
  const getOrders = useCallback(async () => {
    if (sessionStatus !== 'authenticated' || !session?.user?.establishment_id) {
      setLoading(false);
      setError(new Error('No autenticado o ID de establecimiento no disponible.'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Clona los filtros y elimina 'ALL' para pasarlos correctamente a la API
      const apiFilters: { status?: string, orderType?: string } = {};
      if (filters.status && filters.status !== 'ALL') {
        apiFilters.status = filters.status;
      }
      if (filters.orderType && filters.orderType !== 'ALL') {
        apiFilters.orderType = filters.orderType;
      }

      const fetchedOrders = await fetchEmployeeOrders(
        session.user.establishment_id,
        apiFilters
      );
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error('Error al obtener los pedidos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar los pedidos.'));
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus, filters]); // Dependencias del useCallback

  // Ejecutar al montar el componente o cuando cambian las dependencias
  useEffect(() => {
    getOrders();
  }, [getOrders]); // Se ejecuta cuando getOrders cambia (lo que ocurre si las dependencias del useCallback cambian)

  // Función para actualizar los filtros desde el componente OrderFilters
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  return { orders, loading, error, filters, updateFilters, refreshOrders: getOrders };
}
