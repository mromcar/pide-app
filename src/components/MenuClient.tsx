'use client'

type Producto = {
  id_producto: number
  nombre: string
  descripcion: string | null
  precio: string
}

type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string
  productos: Producto[]
}

export default function MenuClient({ carta }: { carta: Categoria[] }) {
  return (
    <div>
      {carta.map((cat) => (
        <section key={cat.id_categoria} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{cat.nombre}</h2>
          <ul>
            {cat.productos.map((prod) => (
              <li key={prod.id_producto} className="mb-2 flex justify-between">
                <span>
                  <span className="font-medium">{prod.nombre}</span>
                  {prod.descripcion && (
                    <span className="text-gray-500 text-sm"> — {prod.descripcion}</span>
                  )}
                </span>
                <span className="text-gray-700">{Number(prod.precio).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
