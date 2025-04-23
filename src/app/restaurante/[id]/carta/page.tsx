import '@/app/globals.css'
import PedidoForm from '@/components/PedidoForm'
import { obtenerCategoriasConProductos, obtenerEstablecimientoPorId, CategoriaConProductos } from '@/services/productos.service'
import Link from 'next/link'

const idiomasDisponibles = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: { lang?: string } }) {
  const restauranteId = Number(params.id)
  const idioma = searchParams?.lang || 'es'

  const restaurante = await obtenerEstablecimientoPorId(restauranteId)
  const categorias = await obtenerCategoriasConProductos(restauranteId, idioma) as CategoriaConProductos[]

  const categoriasSerializadas = categorias.map((categoria) => ({
    ...categoria,
    productos: categoria.productos.map((producto) => ({
      ...producto,
      nombre: producto.traducciones[0]?.nombre ?? producto.nombre,
      descripcion: producto.traducciones[0]?.descripcion ?? producto.descripcion,
      precio: producto.precio?.toString() ?? '0.00',
    })),
  }))

  return (
    <main>
      <div className="mb-4 flex gap-2">
        {idiomasDisponibles.map(({ code, label }) => (
          <Link
            key={code}
            href={`?lang=${code}`}
            className={code === idioma ? 'font-bold underline' : ''}
            scroll={false}
          >
            {label}
          </Link>
        ))}
      </div>
      <h1 className="text-2xl font-bold mb-4">{restaurante?.nombre ?? 'Carta del Restaurante'}</h1>
      <PedidoForm
        categorias={categoriasSerializadas}
        idEstablecimiento={restauranteId}
        idioma={idioma}
      />
    </main>
  )
}
