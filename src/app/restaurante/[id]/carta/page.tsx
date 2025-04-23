import '@/app/globals.css'
import prisma from '@/lib/prisma'
import PedidoForm from '@/components/PedidoForm'

export default async function Page({ params }: { params: { id: string } }) {
  const restauranteId = Number(params.id)

  const restaurante = await prisma.establecimiento.findUnique({
    where: { id_establecimiento: restauranteId },
  })

  const categorias = await prisma.categoria.findMany({
    where: { id_establecimiento: restauranteId },
    include: { productos: true },
    orderBy: { id_categoria: 'asc' },
  })

  const categoriasSerializadas = categorias.map((categoria) => ({
    ...categoria,
    productos: categoria.productos.map((producto) => ({
      ...producto,
      precio: producto.precio?.toString() ?? '0.00',
    })),
  }))

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">{restaurante?.nombre ?? 'Carta del Restaurante'}</h1>
      <PedidoForm categorias={categoriasSerializadas} idEstablecimiento={restauranteId} />
    </main>
  )
}
