'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function GestionCartaEmpleado() {
  const { status } = useSession()
  const [categorias, setCategorias] = useState<any[]>([])
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  useEffect(() => {
    const fetchCategorias = async () => {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setCategorias(data.categorias || data)
    }
    fetchCategorias()
  }, [])

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaCategoria) return
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevaCategoria }),
    })
    if (res.ok) {
      setNuevaCategoria('')
      const data = await res.json()
      setCategorias([...categorias, data.categoria])
    }
  }

  if (status === 'loading') return <div>Cargando...</div>

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Gestión de carta</h1>
      <form onSubmit={handleAddCategoria} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">
          Añadir
        </button>
      </form>
      <ul>
        {categorias.map((cat) => (
          <li key={cat.id_categoria} className="mb-2">
            <b>{cat.nombre}</b>
            <button
              className="ml-2 text-blue-600"
              onClick={async () => {
                const nuevoNombre = prompt('Nuevo nombre de la categoría:', cat.nombre)
                if (nuevoNombre && nuevoNombre !== cat.nombre) {
                  const res = await fetch('/api/menu', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_categoria: cat.id_categoria, nombre: nuevoNombre }),
                  })
                  if (res.ok) {
                    setCategorias(
                      categorias.map((c) =>
                        c.id_categoria === cat.id_categoria ? { ...c, nombre: nuevoNombre } : c
                      )
                    )
                  }
                }
              }}
            >
              Editar
            </button>
            <button
              className="ml-2 text-red-600"
              onClick={async () => {
                if (confirm('¿Seguro que quieres borrar esta categoría?')) {
                  const res = await fetch('/api/menu', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_categoria: cat.id_categoria }),
                  })
                  if (res.ok) {
                    setCategorias(categorias.filter((c) => c.id_categoria !== cat.id_categoria))
                  }
                }
              }}
            >
              Borrar
            </button>
            <ul className="ml-4">
              {cat.productos.map((prod: any) => (
                <li key={prod.id_producto}>
                  {prod.nombre} ({Number(prod.precio).toFixed(2)} €)
                  <button
                    className="ml-2 text-blue-600"
                    onClick={async () => {
                      const nuevoNombre = prompt('Nuevo nombre del producto:', prod.nombre)
                      const nuevoPrecio = prompt('Nuevo precio:', prod.precio)
                      if (
                        nuevoNombre &&
                        nuevoNombre !== prod.nombre &&
                        nuevoPrecio &&
                        !isNaN(Number(nuevoPrecio))
                      ) {
                        const res = await fetch('/api/menu', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id_producto: prod.id_producto,
                            nombre: nuevoNombre,
                            precio: nuevoPrecio,
                          }),
                        })
                        if (res.ok) {
                          setCategorias(
                            categorias.map((c) =>
                              c.id_categoria === cat.id_categoria
                                ? {
                                    ...c,
                                    productos: c.productos.map((p: any) =>
                                      p.id_producto === prod.id_producto
                                        ? { ...p, nombre: nuevoNombre, precio: nuevoPrecio }
                                        : p
                                    ),
                                  }
                                : c
                            )
                          )
                        }
                      }
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="ml-2 text-red-600"
                    onClick={async () => {
                      if (confirm('¿Seguro que quieres borrar este producto?')) {
                        const res = await fetch('/api/menu', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id_producto: prod.id_producto }),
                        })
                        if (res.ok) {
                          setCategorias(
                            categorias.map((c) =>
                              c.id_categoria === cat.id_categoria
                                ? {
                                    ...c,
                                    productos: c.productos.filter(
                                      (p: any) => p.id_producto !== prod.id_producto
                                    ),
                                  }
                                : c
                            )
                          )
                        }
                      }
                    }}
                  >
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  )
}
