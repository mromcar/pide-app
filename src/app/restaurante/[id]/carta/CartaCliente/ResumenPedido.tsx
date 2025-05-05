import { resumenPedidoFijoClasses, btnFinalizarPedidoClasses } from '@/utils/tailwind'

interface OrderSummaryProps {
  total: number
  notes: string
  setNotes: (value: string) => void
  finishOrder: () => void
  disabled: boolean
}

export default function OrderSummary({
  total,
  notes,
  setNotes,
  finishOrder,
  disabled,
}: OrderSummaryProps) {
  return (
    <div className={resumenPedidoFijoClasses}>
      <span className="font-semibold text-lg">
        Total: {total.toFixed(2)} €
      </span>
      <input
        type="text"
        placeholder="Order notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border px-2 py-1 rounded w-64"
      />
      <button
        className={btnFinalizarPedidoClasses}
        disabled={disabled}
        onClick={finishOrder}
      >
        Finish Order
      </button>
    </div>
  )
}
