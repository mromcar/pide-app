import {
  modalOverlayClasses,
  modalContentClasses,
  btnFinalizarPedidoClasses,
} from '@/utils/tailwind'

type Producto = {
  id_producto: number
  nombre: string
  descripcion?: string
  precio: number
  imagen_url?: string
}

export default function ModalProducto({
  producto,
  onClose,
  handleChange,
  cantidad,
  finalizarPedido,
  total,
}: {
  producto: Producto
  onClose: () => void
  handleChange: (id: number, delta: number) => void
  cantidad: number
  finalizarPedido: () => void
  total: number
}) {
  return (
    <div className={modalOverlayClasses}>
      <div className={modalContentClasses}>
        <button className="mb-4 text-blue-600" onClick={onClose}>
          ← Volver a productos
        </button>
        {producto.imagen_url && (
          <img
            src={`/images/${producto.imagen_url}`}
            alt={producto.nombre}
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}
        <h2 className="text-xl font-bold mb-2">{producto.nombre}</h2>
        {producto.descripcion && <p className="mb-2 text-gray-600">{producto.descripcion}</p>}
        <p className="font-semibold text-lg mb-4">{producto.precio} €</p>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => handleChange(producto.id_producto, -1)}>−</button>
          <span>{cantidad}</span>
          <button onClick={() => handleChange(producto.id_producto, 1)}>+</button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
          <button
            className={btnFinalizarPedidoClasses}
            disabled={total === 0}
            onClick={finalizarPedido}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}
