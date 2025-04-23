'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  cardProductoClasses,
  categoriaSectionClasses,
  categoriaTituloClasses,
  productoNombreClasses,
  productoDescripcionClasses,
  productoPrecioClasses,
  contadorClasses,
  contadorBtnClasses,
  btnFinalizarPedidoClasses,
  resumenPedidoFijoClasses,
  fondoAppClasses,
} from '@/utils/tailwind'

const idiomasDisponibles = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

export default function CartaCliente({
  restaurante,
  categorias,
  idioma,
}: {
  restaurante: { nombre: string } | null
  categorias: any[]
  idioma: string
}) {
  const [pedido, setPedido] = useState<{ [id: number]: number }>({})

  const categoriasSerializadas = categorias.map((categoria) => ({
    ...categoria,
    productos: (categoria.productos ?? []).map((producto: any) => ({
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

  return (
    <main className={fondoAppClasses}>
      <div className="mb-4 flex gap-2 justify-center">
        {idiomasDisponibles.map(({ code, label }) => (
          <Link
            key={code}
            href={`?lang=${code}`}
            className={`px-3 py-1 rounded-xl transition-all duration-150 ${
              code === idioma ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 border'
            }`}
            scroll={false}
          >
            {label}
          </Link>
        ))}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">
        {restaurante?.nombre ?? 'Carta del Restaurante'}
      </h1>
      {categoriasSerializadas.map((categoria) => (
        <section key={categoria.id_categoria} className={categoriaSectionClasses}>
          <h2 className={categoriaTituloClasses}>{categoria.nombre}</h2>
          <div className="flex flex-col gap-4">
            {categoria.productos.map((producto: any) => (
              <div key={producto.id_producto} className={cardProductoClasses}>
                <div>
                  <p className={productoNombreClasses}>{producto.nombre}</p>
                  {producto.descripcion && (
                    <p className={productoDescripcionClasses}>{producto.descripcion}</p>
                  )}
                  <p className={productoPrecioClasses}>{producto.precio} €</p>
                </div>
                <div className={contadorClasses}>
                  <button
                    className={contadorBtnClasses}
                    onClick={() => handleChange(producto.id_producto, -1)}
                  >
                    −
                  </button>
                  <span>{pedido[producto.id_producto] || 0}</span>
                  <button
                    className={contadorBtnClasses}
                    onClick={() => handleChange(producto.id_producto, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className={resumenPedidoFijoClasses}>
        <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
        <button
          className={btnFinalizarPedidoClasses}
          disabled={total === 0}
          onClick={() => alert('Pedido enviado')}
        >
          Finalizar
        </button>
      </div>
    </main>
  )
}
