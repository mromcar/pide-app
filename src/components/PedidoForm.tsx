'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Producto = {
  id_producto: number
  nombre: string
  descripcion: string | null
  precio: string
}

type Categoria = {
  id_categoria: number
  nombre: string
  productos: Producto[]
}

export default function PedidoForm({
  categorias,
  idEstablecimiento,
  idioma, // <--- Añade esto
}: {
  categorias: Categoria[]
  idEstablecimiento: number
  idioma: string // <--- Añade esto
}) {
  const [cantidades, setCantidades] = useState<{ [id: number]: number }>({})
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const router = useRouter()

  const handleCantidad = (id: number, value: number) => {
    setCantidades((prev) => ({ ...prev, [id]: value }))
  }

  // Calcular el total del pedido
  const total = categorias.reduce(
    (acc, cat) =>
      acc +
      cat.productos.reduce(
        (accProd, prod) => accProd + (cantidades[prod.id_producto] || 0) * parseFloat(prod.precio),
        0
      ),
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setMensaje(null)

    const productos = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([id_producto, cantidad]) => ({
        id_producto: Number(id_producto),
        cantidad,
      }))

    if (productos.length === 0) {
      setMensaje('Selecciona al menos un producto.')
      setEnviando(false)
      return
    }

    const res = await fetch('/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_establecimiento: idEstablecimiento,
        productos,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/pedido/${data.id_pedido}/estado?lang=${idioma}`)
    } else {
      setMensaje('Error al enviar el pedido.')
    }
    setEnviando(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {categorias.map((cat) => (
        <section key={cat.id_categoria} className="mb-6">
          <h2 className="font-semibold mb-2">{cat.nombre}</h2>
          <ul>
            {cat.productos.map((prod) => {
              const cantidad = cantidades[prod.id_producto] || 0
              const subtotal = cantidad * parseFloat(prod.precio)
              return (
                <li key={prod.id_producto} className="flex items-center gap-2 mb-2">
                  <span className="flex-1">
                    {prod.nombre}{' '}
                    <span className="text-gray-500">({Number(prod.precio).toFixed(2)} €)</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={cantidad || ''}
                    onChange={(e) => handleCantidad(prod.id_producto, Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1"
                    placeholder="0"
                  />
                  <span className="w-24 text-right">
                    {cantidad > 0 && <span>= {subtotal.toFixed(2)} €</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <div className="font-bold text-lg mb-4">Total: {total.toFixed(2)} €</div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Enviar pedido'}
      </button>
      {mensaje && <div className="mt-4">{mensaje}</div>}
    </form>
  )
}
