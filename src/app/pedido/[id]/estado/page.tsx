import { obtenerPedidoPorId } from '@/services/pedidos.service'
import PedidoResumen from '@/components/PedidoResumen'

export default async function EstadoPedidoPage(props: { params: { id: string } }) {
  const { id } = props.params
  const pedidoId = Number(id)
  const pedido = await obtenerPedidoPorId(pedidoId)

  if (!pedido) {
    return <div>Pedido no encontrado.</div>
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Estado de tu pedido</h1>
      <div className="mb-4">
        Estado actual: <b>{pedido.estado}</b>
      </div>
      <PedidoResumen detalles={pedido.detalles} />
    </main>
  )
}
