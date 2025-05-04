import { resumenPedidoFijoClasses, btnFinalizarPedidoClasses } from '@/utils/tailwind'

export default function ResumenPedido({
  total,
  comentario,
  setComentario,
  finalizarPedido,
  disabled,
}: {
  total: number
  comentario: string
  setComentario: (v: string) => void
  finalizarPedido: () => void
  disabled: boolean
}) {
  return (
    <div className={resumenPedidoFijoClasses}>
      <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
      <input
        type="text"
        placeholder="Comentario para el pedido (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="border px-2 py-1 rounded w-64"
      />
      <button className={btnFinalizarPedidoClasses} disabled={disabled} onClick={finalizarPedido}>
        Finalizar
      </button>
    </div>
  )
}
