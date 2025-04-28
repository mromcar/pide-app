import '@/app/globals.css'
import {
  obtenerCategoriasConProductos,
  obtenerEstablecimientoPorId,
} from '@/services/productos.service'
import CartaCliente from './CartaCliente'
import { Prisma } from '@prisma/client'

type CategoriaConProductosPrisma = Prisma.CategoriaGetPayload<{
  include: {
    productos: {
      include: {
        ProductoTraduccion: true
      }
    }
  }
}>

// Serializa Decimals a number
function serializarCategorias(categorias: CategoriaConProductosPrisma[]) {
  return categorias.map((categoria) => ({
    ...categoria,
    productos: categoria.productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio), // Convierte Decimal a number
      ProductoTraduccion:
        producto.ProductoTraduccion?.map((traduccion) => ({
          ...traduccion,
        })) ?? [],
    })),
  }))
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lang?: string }
}) {
  const restauranteId = Number(params.id)
  const idioma = searchParams?.lang || 'es'

  const restaurante = await obtenerEstablecimientoPorId(restauranteId)
  const categorias = await obtenerCategoriasConProductos(restauranteId, idioma)
  const categoriasSerializadas = serializarCategorias(categorias)

  return (
    <CartaCliente
      restaurante={restaurante}
      categorias={categoriasSerializadas}
      idioma={idioma}
    />
  )
}
