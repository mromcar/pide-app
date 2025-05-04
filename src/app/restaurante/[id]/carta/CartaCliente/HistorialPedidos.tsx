type PedidoHistorial = {
  codigo: string
  productos: { id_producto: number; nombre: string; cantidad: number; precio?: number }[]
  total: number
  fecha: string
  estado: string
  comentario: string
}

export default function HistorialPedidos({
  historialPedidos,
  cancelarPedido,
  editandoComentario,
  setEditandoComentario,
  guardarComentarioEditado,
}: {
  historialPedidos: PedidoHistorial[]
  cancelarPedido: (idx: number) => void
  editandoComentario: { idx: number; texto: string } | null
  setEditandoComentario: (v: { idx: number; texto: string } | null) => void
  guardarComentarioEditado: () => void
}) {
  return (
    <ul>
      {historialPedidos.map((p, idx) => (
        <li key={p.codigo} className="mb-4 border-b pb-2">
          <div>
            <span className="font-semibold">Código:</span> {p.codigo}
          </div>
          <div>
            <span className="font-semibold">Fecha:</span> {p.fecha}
          </div>
          <div>
            <span className="font-semibold">Estado:</span>{' '}
            <span className={p.estado === 'Cancelado' ? 'text-red-600' : 'text-green-600'}>
              {p.estado}
            </span>
          </div>
          <div>
            <span className="font-semibold">Comentario:</span>{' '}
            {editandoComentario && editandoComentario.idx === idx ? (
              <>
                <input
                  type="text"
                  value={editandoComentario.texto}
                  onChange={(e) =>
                    setEditandoComentario({ ...editandoComentario, texto: e.target.value })
                  }
                  className="border px-2 py-1 rounded mr-2"
                />
                <button className="text-blue-600 font-bold mr-2" onClick={guardarComentarioEditado}>
                  Guardar
                </button>
                <button className="text-gray-500" onClick={() => setEditandoComentario(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {p.comentario || <span className="italic text-gray-400">Sin comentario</span>}
                {p.estado === 'Pendiente' && (
                  <button
                    className="ml-2 text-blue-600 underline"
                    onClick={() => setEditandoComentario({ idx, texto: p.comentario || '' })}
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
              {p.productos.map((prod) => (
                <li key={prod.id_producto} className="flex justify-between">
                  <span>
                    {prod.nombre} × {prod.cantidad}
                  </span>
                  <span>
                    {prod.precio?.toFixed(2) ?? ''} € x {prod.cantidad} ={' '}
                    <span className="font-semibold">
                      {((prod.precio ?? 0) * prod.cantidad).toFixed(2)} €
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-right">
            <span className="font-bold text-lg text-blue-700">
              Total pedido: {p.total.toFixed(2)} €
            </span>
          </div>
          {p.estado === 'Pendiente' && (
            <button className="mt-2 text-red-600 underline" onClick={() => cancelarPedido(idx)}>
              Cancelar pedido
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
