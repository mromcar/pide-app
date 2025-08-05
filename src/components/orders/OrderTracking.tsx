'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageCode } from '@/constants/languages';
import { getTranslation } from '@/translations';
import { OrderStatus } from '@prisma/client';

// ✅ Agregar la prop lang
interface OrderTrackingProps {
  lang: string;
  orderId: string; // ✅ Cambiar a string para consistencia
  restaurantId: string; // ✅ Agregar parámetro faltante
}

export default function OrderTracking({ lang, orderId, restaurantId }: OrderTrackingProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = getTranslation(lang);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Polling cada 30 segundos para actualizar el estado
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId, restaurantId]); // ✅ Ahora restaurantId está definido

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: t.orderStatus.pending },
      { key: 'confirmed', label: t.orderStatus.confirmed },
      { key: 'preparing', label: t.orderStatus.preparing },
      { key: 'ready', label: t.orderStatus.ready },
      { key: 'delivered', label: t.orderStatus.delivered }
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Order not found</h1>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t.orderConfirmation.trackOrder}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Pedido #{order.order_id}</h2>
            {order.table_number && (
              <p className="text-gray-600">Mesa: {order.table_number}</p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.current 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${
                    step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push(`/${lang}/restaurant/${restaurantId}/menu`)} // ✅ Variables definidas
          className="btnMinimalista w-full"
        >
          {t.orderConfirmation.backToMenu}
        </button>
      </div>
    </div>
  );
}

// En la función del componente, cambiar:
const t = getTranslation(lang) // ✅ Ahora lang está definido