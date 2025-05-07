import { orderMessages } from '@/constants/translations'
import { resumenPedidoFijoClasses, btnFinalizarPedidoClasses } from '@/utils/tailwind'

interface ResumenPedidoProps {
  total: number
  notes: string
  onNotesChange: (notes: string) => void
  onFinishOrder: () => void
  language: string
}

export default function ResumenPedido({
  total,
  notes,
  onNotesChange,
  onFinishOrder,
  language,
}: ResumenPedidoProps) {
  // Default to 'es' if language is not found
  const currentLang = language in orderMessages ? language : 'es'
  const messages = orderMessages[currentLang as keyof typeof orderMessages]

  return (
    <div className={resumenPedidoFijoClasses}>
      <h2>{messages.orderTotal}</h2>
      <span className="font-semibold text-lg">{total.toFixed(2)} €</span>
      <input
        type="text"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder={messages.notesPlaceholder}
        className="w-full p-2 border rounded"
      />
      <button onClick={onFinishOrder} className={btnFinalizarPedidoClasses} disabled={total === 0}>
        {messages.placeOrder}
      </button>
    </div>
  )
}
