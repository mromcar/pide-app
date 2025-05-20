// src/app/restaurant/[id]/menu/components/OrderHistory.tsx
import type { OrderStatus } from '@prisma/client'
import { orderStatusLabels } from '@/constants/enums' // Asumo que orderStatusLabels está en este archivo
import { SerializedOrder } from '@/types/order' // Importa el tipo SerializedOrder
import type { LanguageCode } from '@/constants/languages' // Importa LanguageCode
import { uiTranslations } from '@/translations/ui' // Para tus traducciones UI

interface OrderHistoryProps {
  orders: SerializedOrder[] // Ahora recibe un array de SerializedOrder
  language: LanguageCode // Idioma para las traducciones
  // Ya no necesita: cancelOrder, editingNote, setEditingNote, saveEditedNote, onStatusChange
}

export default function OrderHistory({ orders, language }: OrderHistoryProps) {
  const t = uiTranslations[language] // Accede a las traducciones

  if (orders.length === 0) {
    return <p className="text-center text-gray-500 mt-8">{t.noOrdersYet}</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">{t.yourOrders}</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.order_id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg text-blue-700">
                {t.orderCode}: {order.order_id}
              </span>
              <span
                className={`status-badge ${order.status === OrderStatus.PENDING ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}
              >
                {orderStatusLabels[order.status]}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span>
                {t.date}: {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            {order.notes && (
              <div className="mb-2">
                <span className="font-semibold">{t.notes}:</span> {order.notes}
              </div>
            )}
            <div>
              <span className="font-semibold">{t.products}:</span>
              <ul className="ml-4 list-disc list-inside">
                {order.items.map((item) => (
                  <li key={item.order_item_id} className="flex justify-between text-gray-800">
                    <span>
                      {item.variant.product.name} ({item.variant.variant_description}) ×{' '}
                      {item.quantity}
                    </span>
                    <span>
                      {item.unit_price.toFixed(2)} € x {item.quantity} ={' '}
                      <span className="font-semibold">
                        {(item.unit_price * item.quantity).toFixed(2)} €
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 text-right border-t pt-2">
              <span className="font-bold text-xl text-blue-800">
                {t.orderTotal}: {order.total_amount.toFixed(2)} €
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Puedes añadir estas traducciones en src/translations/ui.ts si no las tienes ya
/*
export const uiTranslations = {
  es: {
    // ... otras traducciones
    orderPlaced: '¡Pedido realizado con éxito!',
    orderConfirmationMessage: 'Tu pedido ha sido enviado y está siendo procesado.',
    placeAnotherOrder: 'Hacer otro pedido',
    noOrdersYet: 'Aún no hay pedidos registrados.',
    yourOrders: 'Tus Pedidos',
    orderCode: 'Código de Pedido',
    date: 'Fecha',
    notes: 'Notas',
    products: 'Productos',
    orderTotal: 'Total del pedido',
  },
  en: {
    // ... otras traducciones
    orderPlaced: 'Order placed successfully!',
    orderConfirmationMessage: 'Your order has been sent and is being processed.',
    placeAnotherOrder: 'Place another order',
    noOrdersYet: 'No orders yet.',
    yourOrders: 'Your Orders',
    orderCode: 'Order Code',
    date: 'Date',
    notes: 'Notes',
    products: 'Products',
    orderTotal: 'Order Total',
  }
};
*/
