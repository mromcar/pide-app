import { obtenerPedidoPorId } from '@/services/pedidos.service'
import PedidoResumen from '@/components/PedidoResumen'
import { pageMainClasses, pageTitleClasses, pageSectionClasses } from '@/utils/tailwind'

export default async function EstadoPedidoPage(props: { params: { id: string } }) {
  const { id } = props.params
  const pedidoId = Number(id)
  const pedido = await obtenerPedidoPorId(pedidoId)

  if (!pedido) {
    return <div>Pedido no encontrado.</div>
  }

  return (
    <main className={pageMainClasses}>
      <h1 className={pageTitleClasses}>Estado de tu pedido</h1>
      <div className={pageSectionClasses}>
        Estado actual: <b>{pedido.estado}</b>
      </div>
      <PedidoResumen detalles={pedido.detalles} />
    </main>
  )
}
