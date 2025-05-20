// src/app/restaurant/[id]/menu/components/OrderSummary.tsx
import { orderMessages } from '@/constants/translations' // Asegúrate de que orderMessages exista
import { resumenPedidoFijoClasses, btnFinalizarPedidoClasses } from '@/utils/tailwind'
import type { LanguageCode } from '@/constants/languages' // Importa LanguageCode
import { uiTranslations } from '@/translations/ui' // Para tus traducciones UI

interface ResumenPedidoProps {
  total: number
  notes: string
  onNotesChange: (notes: string) => void
  onFinishOrder: () => Promise<void> // Ahora es una promesa porque es async
  language: LanguageCode // Tipo LanguageCode
  disabled: boolean
  isSending: boolean // Nuevo prop para indicar si el pedido se está enviando
  orderError: string | null // Nuevo prop para mostrar errores
  tableNumber: string // Nuevo prop para el número de mesa
  onTableNumberChange: (tableNumber: string) => void // Función para actualizar el número de mesa
}

export default function ResumenPedido({
  total,
  notes,
  onNotesChange,
  onFinishOrder,
  language,
  disabled,
  isSending,
  orderError,
  tableNumber,
  onTableNumberChange,
}: ResumenPedidoProps) {
  const t = uiTranslations[language] // Accede a las traducciones

  return (
    <div className={resumenPedidoFijoClasses}>
      <h2 className="text-xl font-bold mb-2">{t.orderSummary}</h2> {/* Traducción del título */}
      {/* Input para el número de mesa */}
      <input
        type="text"
        value={tableNumber}
        onChange={(e) => onTableNumberChange(e.target.value)}
        placeholder={t.tableNumberPlaceholder}
        className="w-full p-2 border rounded mb-2"
        disabled={isSending}
      />
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg">{t.total}:</span> {/* Traducción de "Total" */}
        <span className="font-semibold text-lg">{total.toFixed(2)} €</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder={t.notesPlaceholder}
        className="w-full p-2 border rounded mb-4 h-20 resize-none"
        disabled={isSending}
      />
      {orderError && <p className="text-red-500 text-sm mb-2 text-center">{orderError}</p>}
      <button
        onClick={onFinishOrder}
        className={btnFinalizarPedidoClasses}
        disabled={disabled || isSending} // Deshabilitar si está enviando o el carrito está vacío
      >
        {isSending ? t.sendingOrder : t.placeOrder} {/* Cambiar texto durante el envío */}
      </button>
    </div>
  )
}

// Asegúrate de añadir estas traducciones en src/translations/ui.ts
/*
export const uiTranslations = {
  es: {
    // ... otras traducciones
    orderSummary: 'Resumen del Pedido',
    total: 'Total',
    notesPlaceholder: 'Notas adicionales (ej. sin cebolla, alergias)',
    tableNumberPlaceholder: 'Número de mesa',
    placeOrder: 'Realizar Pedido',
    sendingOrder: 'Enviando Pedido...',
    emptyCartError: 'El carrito está vacío.',
    tableNumberRequired: 'El número de mesa es requerido.',
    orderError: 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.',
  },
  en: {
    // ... otras traducciones
    orderSummary: 'Order Summary',
    total: 'Total',
    notesPlaceholder: 'Additional notes (e.g., no onion, allergies)',
    tableNumberPlaceholder: 'Table number',
    placeOrder: 'Place Order',
    sendingOrder: 'Sending Order...',
    emptyCartError: 'Cart is empty.',
    tableNumberRequired: 'Table number is required.',
    orderError: 'There was an error processing your order. Please try again.',
  }
};
*/
