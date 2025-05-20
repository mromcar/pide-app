// src/components/order/OrderFilters.tsx
'use client';

import React from 'react';
import { OrderFilters as OrderFiltersType } from '@/hooks/useOrders'; // Importa el tipo de filtros
import { OrderStatus } from '@prisma/client'; // Para los enums de estado

interface OrderFiltersProps {
  currentFilters: OrderFiltersType;
  onFiltersChange: (newFilters: Partial<OrderFiltersType>) => void;
}

export function OrderFilters({ currentFilters, onFiltersChange }: OrderFiltersProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ status: e.target.value as OrderStatus | 'ALL' });
  };

  const handleOrderTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ orderType: e.target.value as string | 'ALL' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row md:justify-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
      {/* Filtro por Estado */}
      <div className="flex-grow">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Estado:
        </label>
        <select
          id="statusFilter"
          value={currentFilters.status || 'ALL'}
          onChange={handleStatusChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white cursor-pointer"
        >
          <option value="ALL">Todos los Estados</option>
          {Object.values(OrderStatus).map(status => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')} {/* Ej: PENDING -> PENDING */}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Tipo de Pedido (si aplicas esta distinción a nivel de API) */}
      <div className="flex-grow">
        <label htmlFor="orderTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Tipo:
        </label>
        <select
          id="orderTypeFilter"
          value={currentFilters.orderType || 'ALL'}
          onChange={handleOrderTypeChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white cursor-pointer"
        >
          <option value="ALL">Todos los Tipos</option>
          <option value="MESA">Mesa</option>
          <option value="PARA_LLEVAR">Para Llevar</option>
          <option value="DOMICILIO">A Domicilio</option>
          {/* Añade más tipos si los tienes en tu OrderType enum o string */}
        </select>
      </div>
      {/* Puedes añadir más filtros aquí: por fecha, por camarero, etc. */}
    </div>
  );
}
