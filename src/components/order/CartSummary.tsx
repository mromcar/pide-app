type DetallePedido = {
  id_detalle_pedido: number
  cantidad: number
  producto: {
    nombre: string
    precio: string
  }
}

export default function PedidoResumen({ detalles }: { detalles: DetallePedido[] }) {
  const total = detalles.reduce((acc, d) => acc + d.cantidad * parseFloat(d.producto.precio), 0)

  return (
    <div>
      <h2 className="font-bold mb-4">Resumen del pedido</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Producto</th>
            <th className="border px-2">Cantidad</th>
            <th className="border px-2">Precio unitario</th>
            <th className="border px-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d) => (
            <tr key={d.id_detalle_pedido}>
              <td className="border px-2">{d.producto.nombre}</td>
              <td className="border px-2 text-center">{d.cantidad}</td>
              <td className="border px-2 text-right">{Number(d.producto.precio).toFixed(2)} €</td>
              <td className="border px-2 text-right">
                {(d.cantidad * parseFloat(d.producto.precio)).toFixed(2)} €
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-2 font-bold" colSpan={3}>
              Total
            </td>
            <td className="border px-2 font-bold text-right">{total.toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
