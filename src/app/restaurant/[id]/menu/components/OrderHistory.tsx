import type { OrderStatus } from '@prisma/client'
import { ORDER_STATUS, orderStatusLabels } from '@/constants/enums'

type OrderHistory = {
  code: string
  items: {
    variant_id: number
    variant_description: string
    quantity: number
    unit_price: number
  }[]
  total_amount: number
  date: string
  completedAt?: string
  status: OrderStatus
  notes: string
}

interface HistorialPedidosProps {
  orderHistory: OrderHistory[]
  cancelOrder: (idx: number) => void
  editingNote: { idx: number; text: string } | null
  setEditingNote: (v: { idx: number; text: string } | null) => void
  saveEditedNote: () => void
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void
}

export default function HistorialPedidos({
  orderHistory,
  cancelOrder,
  editingNote,
  setEditingNote,
  saveEditedNote,
  onStatusChange,
}: HistorialPedidosProps) {
  return (
    <ul>
      {orderHistory.map((order, idx) => (
        <li key={order.code} className="mb-4 border-b pb-2">
          <div>
            <span className="font-semibold">Código:</span> {order.code}
          </div>
          <div>
            <span className="font-semibold">Fecha:</span> {order.date}
          </div>
          {order.completedAt && (
            <div>
              <span className="font-semibold">Completado el:</span> {order.completedAt}
            </div>
          )}
          <div>
            <span className="font-semibold">Estado:</span>{' '}
            <span className="status-badge">{orderStatusLabels[order.status]}</span>
          </div>
          <div>
            <span className="font-semibold">Notas:</span>{' '}
            {editingNote && editingNote.idx === idx ? (
              <>
                <input
                  type="text"
                  value={editingNote.text}
                  onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                  className="border px-2 py-1 rounded mr-2"
                />
                <button className="text-blue-600 font-bold mr-2" onClick={saveEditedNote}>
                  Guardar
                </button>
                <button className="text-gray-500" onClick={() => setEditingNote(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {order.notes || <span className="italic text-gray-400">Sin notas</span>}
                {order.status === OrderStatus.PENDING && (
                  <button
                    className="ml-2 text-blue-600 underline"
                    onClick={() => setEditingNote({ idx, text: order.notes || '' })}
                  >
                    Editar
                  </button>
                )}
              </>
            )}
          </div>
          <div>
            <span className="font-semibold">Productos:</span>
            <ul className="ml-4">
              {order.items.map((item) => (
                <li key={item.variant_id} className="flex justify-between">
                  <span>
                    {item.variant_description} × {item.quantity}
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
          <div className="mt-2 text-right">
            <span className="font-bold text-lg text-blue-700">
              Total pedido: {order.total_amount.toFixed(2)} €
            </span>
          </div>
          {order.status === ORDER_STATUS.PENDING && (
            <div className="mt-2 space-x-2">
              <button className="text-red-600 underline" onClick={() => cancelOrder(idx)}>
                Cancelar pedido
              </button>
              <button
                className="text-green-600 underline"
                onClick={() => onStatusChange(idx, ORDER_STATUS.COMPLETED)}
              >
                Marcar como completado
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
