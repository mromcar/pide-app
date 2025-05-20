'use client'
import { useEffect, useState } from 'react'

type Producto = {
  id_producto: number
  nombre: string
  precio: string
}

type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string
  productos: Producto[]
}

export default function AdminCartaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => setCategorias(data.categorias || []))
  }, [])

  return (
    <div>
      <h1>Gestión de carta</h1>
      {categorias.map((cat) => (
        <div key={cat.id_categoria}>
          <h2>{cat.nombre}</h2>
          <ul>
            {cat.productos.map((prod) => (
              <li key={prod.id_producto}>
                {prod.nombre} - {prod.precio}€
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
