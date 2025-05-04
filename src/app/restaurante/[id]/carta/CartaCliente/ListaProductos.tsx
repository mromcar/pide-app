import { Producto } from '@/types/carta'
import {
  cardProductoClasses,
  productoNombreClasses,
  productoDescripcionClasses,
  productoPrecioClasses,
  contadorClasses,
  btnCantidadCompactoClasses,
  indicadorCantidadClasses,
  productoImgClasses,
} from '@/utils/tailwind'

type ListaProductosProps = {
  productos: Producto[]
  onSelectProducto: (producto: Producto) => void
  handleChange: (id: number, delta: number) => void
  pedido: { [id: number]: number }
  idioma: string
}

export default function ListaProductos({
  productos,
  onSelectProducto,
  handleChange,
  pedido,
  idioma,
}: ListaProductosProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-40">
      {productos.map((producto) => {
        const traduccion = producto.ProductoTraduccion?.find((t) => t.idioma === idioma)
        const nombre = traduccion?.nombre || producto.nombre
        const descripcion = traduccion?.descripcion || producto.descripcion

        return (
          <div
            key={producto.id_producto}
            className={cardProductoClasses}
            onClick={() => onSelectProducto(producto)}
          >
            {producto.imagen_url && (
              <img
                src={`/images/${producto.imagen_url}`}
                alt={nombre}
                className={productoImgClasses}
              />
            )}
            <div>
              <p className={productoNombreClasses}>{nombre}</p>
              {descripcion && <p className={productoDescripcionClasses}>{descripcion}</p>}
              <p className={productoPrecioClasses}>{producto.precio} €</p>
            </div>
            <div className={contadorClasses}>
              <button
                className={btnCantidadCompactoClasses}
                onClick={(e) => {
                  e.stopPropagation()
                  handleChange(producto.id_producto, -1)
                }}
              >
                −
              </button>
              <span className={indicadorCantidadClasses}>{pedido[producto.id_producto] || 0}</span>
              <button
                className={btnCantidadCompactoClasses}
                onClick={(e) => {
                  e.stopPropagation()
                  handleChange(producto.id_producto, 1)
                }}
              >
                +
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
