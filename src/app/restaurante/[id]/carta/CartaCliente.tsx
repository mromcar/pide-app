'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  appContainerClasses,
  idiomaSelectorClasses,
  idiomaBtnClasses,
  cardProductoClasses,
  categoriaTituloClasses,
  productoNombreClasses,
  productoDescripcionClasses,
  productoPrecioClasses,
  contadorClasses,
  btnCantidadCompactoClasses,
  indicadorCantidadClasses,
  btnFinalizarPedidoClasses,
  resumenPedidoFijoClasses,
  categoriaSectionClasses,
} from '@/utils/tailwind'

const idiomasDisponibles = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

type Producto = {
  id_producto: number
  nombre: string
  descripcion?: string
  precio: number
  imagen_url?: string
  ProductoTraduccion: { nombre: string; descripcion?: string }[]
}

type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string
  productos: Producto[]
}

type PedidoHistorial = {
  codigo: string
  productos: { id_producto: number; nombre: string; cantidad: number; precio?: number }[]
  total: number
  fecha: string
  estado: string
  comentario: string
}

function generarCodigoPedido() {
  // Ejemplo: PED-20240502-XXXX
  return `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
}

export default function CartaCliente({
  restaurante,
  categorias,
  idioma,
}: {
  restaurante: { nombre: string } | null
  categorias: Categoria[]
  idioma: string
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [pedido, setPedido] = useState<{ [id: number]: number }>({})
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [comentario, setComentario] = useState('')
  const [historialPedidos, setHistorialPedidos] = useState<PedidoHistorial[]>([])
  const [editandoComentario, setEditandoComentario] = useState<{
    idx: number
    texto: string
  } | null>(null)

  // Traducción y serialización
  const categoriasSerializadas = categorias.map((categoria) => ({
    ...categoria,
    productos: (categoria.productos ?? []).map((producto: Producto) => ({
      ...producto,
      nombre: producto.ProductoTraduccion[0]?.nombre ?? producto.nombre,
      descripcion: producto.ProductoTraduccion[0]?.descripcion ?? producto.descripcion,
      precio: Number(producto.precio) || 0,
    })),
  }))

  const handleChange = (id: number, delta: number) => {
    setPedido((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }
      if (next[id] === 0) delete next[id]
      return next
    })
  }

  const total = categoriasSerializadas
    .flatMap((cat) => cat.productos)
    .reduce((sum, prod) => sum + (pedido[prod.id_producto] || 0) * (prod.precio || 0), 0)

  // Finalizar pedido y guardar en historial
  const finalizarPedido = () => {
    const productosPedido = Object.entries(pedido)
      .map(([id, cantidad]) => {
        const prod = categoriasSerializadas
          .flatMap((cat) => cat.productos)
          .find((p) => p.id_producto === Number(id))
        return prod
          ? { id_producto: prod.id_producto, nombre: prod.nombre, cantidad, precio: prod.precio }
          : null
      })
      .filter(Boolean) as {
      id_producto: number
      nombre: string
      cantidad: number
      precio?: number
    }[]

    setHistorialPedidos((prev) => [
      ...prev,
      {
        codigo: generarCodigoPedido(),
        productos: productosPedido,
        total,
        fecha: new Date().toLocaleString(),
        estado: 'Pendiente',
        comentario,
      },
    ])
    setPedido({})
    setComentario('')
    setPedidoEnviado(true)
    setCategoriaSeleccionada(null)
    setProductoSeleccionado(null)
  }

  // Modificar comentario de un pedido pendiente
  const guardarComentarioEditado = () => {
    if (editandoComentario) {
      setHistorialPedidos((prev) =>
        prev.map((p, idx) =>
          idx === editandoComentario.idx ? { ...p, comentario: editandoComentario.texto } : p
        )
      )
      setEditandoComentario(null)
    }
  }

  // Cancelar pedido pendiente
  const cancelarPedido = (idx: number) => {
    setHistorialPedidos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, estado: 'Cancelado' } : p))
    )
  }

  // VISTA DE PEDIDO ENVIADO + HISTORIAL
  if (pedidoEnviado) {
    return (
      <main className={appContainerClasses}>
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">¡Pedido realizado!</h1>
        <p className="mb-4 text-center text-gray-700">
          Estado: <span className="font-semibold text-green-600">Pendiente</span>
        </p>
        <button className={btnFinalizarPedidoClasses} onClick={() => setPedidoEnviado(false)}>
          Volver a pedir
        </button>
        <h2 className="text-xl font-bold mt-8 mb-2">Tus pedidos enviados</h2>
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
                    <button
                      className="text-blue-600 font-bold mr-2"
                      onClick={guardarComentarioEditado}
                    >
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
      </main>
    )
  }

  // VISTA DE PRODUCTO (modal simple)
  if (productoSeleccionado) {
    return (
      <main className={appContainerClasses}>
        <button className="mb-4 text-blue-600" onClick={() => setProductoSeleccionado(null)}>
          ← Volver a productos
        </button>
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
          {productoSeleccionado.imagen_url && (
            <img
              src={`/images/${productoSeleccionado.imagen_url}`}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          )}
          <h2 className="text-xl font-bold mb-2">{productoSeleccionado.nombre}</h2>
          {productoSeleccionado.descripcion && (
            <p className="mb-2 text-gray-600">{productoSeleccionado.descripcion}</p>
          )}
          <p className="font-semibold text-lg mb-4">{productoSeleccionado.precio} €</p>
          <div className={contadorClasses}>
            <button
              className={btnCantidadCompactoClasses}
              onClick={() => handleChange(productoSeleccionado.id_producto, -1)}
            >
              −
            </button>
            <span className={indicadorCantidadClasses}>
              {pedido[productoSeleccionado.id_producto] || 0}
            </span>
            <button
              className={btnCantidadCompactoClasses}
              onClick={() => handleChange(productoSeleccionado.id_producto, 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className={resumenPedidoFijoClasses}>
          <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
          <button
            className={btnFinalizarPedidoClasses}
            disabled={total === 0}
            onClick={finalizarPedido}
          >
            Finalizar
          </button>
        </div>
        <img src="/images/c111.jpg" alt="test" style={{ width: 200, height: 100 }} />
      </main>
    )
  }

  // VISTA DE PRODUCTOS DE UNA CATEGORÍA
  if (categoriaSeleccionada !== null) {
    const categoria = categoriasSerializadas.find(
      (cat) => cat.id_categoria === categoriaSeleccionada
    )
    return (
      <main className={appContainerClasses}>
        <button className="mb-4 text-blue-600" onClick={() => setCategoriaSeleccionada(null)}>
          ← Volver a categorías
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{categoria?.nombre}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categoria?.productos.map((producto) => (
            <div
              key={producto.id_producto}
              className={cardProductoClasses + ' cursor-pointer'}
              onClick={() => setProductoSeleccionado(producto)}
            >
              {producto.imagen_url && (
                <img
                  src={`/images/${producto.imagen_url}`}
                  alt={producto.nombre}
                  className="w-full h-32 object-cover rounded-xl mb-2"
                />
              )}
              <div>
                <p className={productoNombreClasses}>{producto.nombre}</p>
                {producto.descripcion && (
                  <p className={productoDescripcionClasses}>{producto.descripcion}</p>
                )}
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
                <span className={indicadorCantidadClasses}>
                  {pedido[producto.id_producto] || 0}
                </span>
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
          ))}
        </div>
        <div className={resumenPedidoFijoClasses}>
          <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
          <button
            className={btnFinalizarPedidoClasses}
            disabled={total === 0}
            onClick={finalizarPedido}
          >
            Finalizar
          </button>
        </div>
      </main>
    )
  }

  // VISTA DE CATEGORÍAS
  return (
    <main className={appContainerClasses}>
      <div className={idiomaSelectorClasses}>
        {idiomasDisponibles.map(({ code, label }) => (
          <Link
            key={code}
            href={`?lang=${code}`}
            className={idiomaBtnClasses(code === idioma)}
            scroll={false}
          >
            {label}
          </Link>
        ))}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">
        {restaurante?.nombre ?? 'Carta del Restaurante'}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {categoriasSerializadas.map((categoria) => (
          <section
            key={categoria.id_categoria}
            className={categoriaSectionClasses + ' cursor-pointer'}
            onClick={() => setCategoriaSeleccionada(categoria.id_categoria)}
          >
            <h2 className={categoriaTituloClasses + ' mb-2 text-center'}>{categoria.nombre}</h2>
            {categoria.imagen_url && (
              <img
                src={`/images/${categoria.imagen_url}`}
                alt={categoria.nombre}
                className="w-full h-48 object-cover rounded-xl mb-4"
                style={{ objectFit: 'cover', width: '100%', height: '192px' }} // h-48 = 12rem = 192px
              />
            )}
          </section>
        ))}
      </div>
      <div className={resumenPedidoFijoClasses}>
        <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
        <input
          type="text"
          placeholder="Comentario para el pedido (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="ml-4 border px-2 py-1 rounded w-64"
        />
        <button
          className={btnFinalizarPedidoClasses}
          disabled={total === 0}
          onClick={finalizarPedido}
        >
          Finalizar
        </button>
      </div>
    </main>
  )
}
