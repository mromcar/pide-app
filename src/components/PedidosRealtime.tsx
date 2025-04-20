'use client'

import { useEffect, useState } from 'react'

const ESTADOS = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'COMPLETADO', 'CANCELADO']

function getNextEstado(estado: string) {
  const idx = ESTADOS.indexOf(estado)
  return idx >= 0 && idx < ESTADOS.length - 2 ? ESTADOS[idx + 1] : null
}

export default function PedidosRealtime() {
  interface DetallePedido {
    id_detalle_pedido: number
    cantidad: number
    producto: {
      nombre: string
    }
  }

  interface Pedido {
    id_pedido: number
    estado: string
    detalles: DetallePedido[]
  }

  const [pedidos, setPedidos] = useState<Pedido[]>([])

  const fetchPedidos = async () => {
    const res = await fetch('/api/pedidos')
    if (!res.ok) {
      setPedidos([])
      return
    }
    const data = await res.json()
    setPedidos(data.pedidos)
  }

  useEffect(() => {
    fetchPedidos()
    const interval = setInterval(fetchPedidos, 5000)
    return () => clearInterval(interval)
  }, [])

  const cambiarEstado = async (id_pedido: number, nuevoEstado: string) => {
    await fetch('/api/pedidos', {
      method: 'PUT',
      body: JSON.stringify({ id_pedido, estado: nuevoEstado }),
    })
    fetchPedidos()
  }

  return (
    <ul>
      {pedidos.map((pedido) => (
        <li key={pedido.id_pedido} className="mb-4 border-b pb-2">
          <div>
            <b>Pedido #{pedido.id_pedido}</b> - Estado: <b>{pedido.estado}</b>
          </div>
          <div>
            {Array.isArray(pedido.detalles) && pedido.detalles.length > 0 ? (
              pedido.detalles.map((det) => (
                <div key={det.id_detalle_pedido}>
                  {det.cantidad} x {det.producto.nombre}
                </div>
              ))
            ) : (
              <div className="text-gray-400 italic">Sin detalles</div>
            )}
          </div>
          <div className="mt-2">
            {getNextEstado(pedido.estado) && (
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded"
                onClick={() => cambiarEstado(pedido.id_pedido, getNextEstado(pedido.estado)!)}
              >
                Marcar como {getNextEstado(pedido.estado)}
              </button>
            )}
            {pedido.estado !== 'CANCELADO' && (
              <button
                className="bg-red-600 text-white px-2 py-1 rounded ml-2"
                onClick={() => cambiarEstado(pedido.id_pedido, 'CANCELADO')}
              >
                Cancelar
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
