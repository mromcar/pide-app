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
    id: categoria.id_categoria, // Map 'id_categoria' to 'id'
    nombre: categoria.nombre,
    productos: categoria.productos.map((producto) => ({
      id: producto.id_producto, // Map 'id_producto' to 'id'
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio), // Convierte Decimal a number
      ProductoTraduccion:
        producto.ProductoTraduccion?.map((traduccion) => ({
          id: traduccion.id_traduccion, // Ensure 'id_traduccion' is included
          nombre: traduccion.nombre, // Include 'nombre' field
          descripcion: traduccion.descripcion,
        })) ?? [],
    })),
  }))
}

// Transforma productos y traducciones para que descripcion nunca sea null
function normalizarCategorias(
  categorias: {
    id: number
    nombre: string
    productos: {
      id: number
      nombre: string
      descripcion: string | null
      precio: number
      ProductoTraduccion: {
        id: number
        nombre: string
        descripcion: string | null
      }[]
    }[]
  }[]
) {
  return categorias.map((cat) => ({
    id_categoria: cat.id, // Map 'id' back to 'id_categoria'
    nombre: cat.nombre,
    productos: cat.productos.map((prod) => ({
      id_producto: prod.id, // Map 'id' back to 'id_producto'
      nombre: prod.nombre,
      descripcion: prod.descripcion ?? undefined,
      precio: prod.precio,
      ProductoTraduccion: prod.ProductoTraduccion.map((tr) => ({
        nombre: tr.nombre, // Incluye nombre
        descripcion: tr.descripcion ?? undefined,
      })),
    })),
  }))
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const { lang } = await searchParams
  const restauranteId = Number(id)
  const idioma = lang || 'es'

  const restaurante = await obtenerEstablecimientoPorId(restauranteId)
  const categorias = await obtenerCategoriasConProductos(restauranteId, idioma)
  const categoriasSerializadas = serializarCategorias(categorias)
  const categoriasNormalizadas = normalizarCategorias(categoriasSerializadas)

  return (
    <CartaCliente restaurante={restaurante} categorias={categoriasNormalizadas} idioma={idioma} />
  )
}
