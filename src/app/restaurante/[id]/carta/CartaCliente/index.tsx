'use client'
import { useState, useCallback, useMemo } from 'react'
import SelectorDeIdioma from './SelectorDeIdioma'
import ListaCategorias from './ListaCategorias'
import ListaProductos from './ListaProductos'
import ModalProducto from './ModalProducto'
import ResumenPedido from './ResumenPedido'
import HistorialPedidos from './HistorialPedidos'
import { appContainerClasses } from '@/utils/tailwind'
import { Producto, Categoria } from '@/types/carta'

const idiomasDisponibles = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

type PedidoHistorial = {
  codigo: string
  productos: { id_producto: number; nombre: string; cantidad: number; precio?: number }[]
  total: number
  fecha: string
  estado: string
  comentario: string
}

function generarCodigoPedido() {
  return `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
}

export default function CartaCliente({
  restaurante,
  categorias,
  idioma,
  mostrarProductosDeCategoriaId,
}: {
  restaurante: { nombre: string } | null
  categorias: Categoria[]
  idioma: string
  mostrarProductosDeCategoriaId?: number
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(
    mostrarProductosDeCategoriaId ?? null
  )
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
    productos: (categoria.productos ?? []).map((producto: Producto) => {
      const traduccion = producto.ProductoTraduccion?.find((t) => t.idioma === idioma)
      const nombre = traduccion?.nombre ?? producto.nombre
      const descripcion = traduccion?.descripcion ?? producto.descripcion
      return {
        ...producto,
        nombre,
        descripcion,
        precio: Number(producto.precio) || 0,
        ProductoTraduccion: producto.ProductoTraduccion ?? [],
      }
    }),
  }))

  const handleChange = (id: number, delta: number) => {
    setPedido((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }
      if (next[id] === 0) delete next[id]
      return next
    })
  }

  const calcularTotal = useCallback(
    () =>
      categoriasSerializadas
        .flatMap((cat) => cat.productos)
        .reduce((sum, prod) => sum + (pedido[prod.id_producto] || 0) * (prod.precio || 0), 0),
    [categoriasSerializadas, pedido]
  )

  const total = useMemo(calcularTotal, [calcularTotal])

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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setPedidoEnviado(false)}
        >
          Volver a pedir
        </button>
        <HistorialPedidos
          historialPedidos={historialPedidos}
          cancelarPedido={cancelarPedido}
          editandoComentario={editandoComentario}
          setEditandoComentario={setEditandoComentario}
          guardarComentarioEditado={guardarComentarioEditado}
        />
      </main>
    )
  }

  // VISTA DE MODAL DE PRODUCTO
  if (productoSeleccionado) {
    return (
      <ModalProducto
        producto={productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
        handleChange={handleChange}
        cantidad={pedido[productoSeleccionado.id_producto] || 0}
        finalizarPedido={finalizarPedido}
        total={total}
      />
    )
  }

  // VISTA DE PRODUCTOS DE UNA CATEGORÍA
  if (categoriaSeleccionada !== null) {
    const categoria = categoriasSerializadas.find(
      (cat) => cat.id_categoria === categoriaSeleccionada
    )
    const mostrarVolver = !mostrarProductosDeCategoriaId
    const titulo =
      categorias.length === 1 && mostrarProductosDeCategoriaId
        ? restaurante?.nombre
        : categoria?.nombre

    return (
      <main className={appContainerClasses}>
        <SelectorDeIdioma idioma={idioma} idiomasDisponibles={idiomasDisponibles} />
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{restaurante?.nombre}</h1>
        {mostrarVolver && (
          <button className="mb-4 text-blue-600" onClick={() => setCategoriaSeleccionada(null)}>
            ← Volver a categorías
          </button>
        )}
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">{titulo}</h2>
        <ListaProductos
          productos={categoria?.productos ?? []}
          onSelectProducto={(producto) => setProductoSeleccionado(producto)}
          handleChange={handleChange}
          pedido={pedido}
          idioma={idioma}
        />
        <ResumenPedido
          total={total}
          comentario={comentario}
          setComentario={setComentario}
          finalizarPedido={finalizarPedido}
          disabled={total === 0}
        />
      </main>
    )
  }

  // VISTA DE CATEGORÍAS
  return (
    <main className={appContainerClasses}>
      <SelectorDeIdioma idioma={idioma} idiomasDisponibles={idiomasDisponibles} />
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">
        {restaurante?.nombre ?? 'Carta del Restaurante'}
      </h1>
      <ListaCategorias
        categorias={categoriasSerializadas}
        onSelectCategoria={setCategoriaSeleccionada}
      />
      <ResumenPedido
        total={total}
        comentario={comentario}
        setComentario={setComentario}
        finalizarPedido={finalizarPedido}
        disabled={total === 0}
      />
    </main>
  )
}
