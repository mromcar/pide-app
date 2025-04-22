import { useEffect, useState } from 'react'

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([])
  const [estado, setEstado] = useState('')

  useEffect(() => {
    const fetchPedidos = async () => {
      let url = '/api/pedidos'
      if (estado) url += `?estado=${estado}`
      const res = await fetch(url)
      const data = await res.json()
      setPedidos(data.pedidos || [])
    }
    fetchPedidos()
  }, [estado])

  return (
    <div>
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="">Todos menos COMPLETADO</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN_PREPARACION">En preparación</option>
        <option value="LISTO">Listo</option>
        <option value="ENTREGADO">Entregado</option>
        <option value="CANCELADO">Cancelado</option>
        <option value="COMPLETADO">Completado</option>
      </select>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id_pedido}>
            Pedido #{pedido.id_pedido} - Estado: {pedido.estado}
          </li>
        ))}
      </ul>
    </div>
  )
}
