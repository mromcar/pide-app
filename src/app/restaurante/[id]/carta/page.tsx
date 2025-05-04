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

// Serializa Decimals a number y añade imagen_url
function serializarCategorias(categorias: CategoriaConProductosPrisma[]) {
  return categorias.map((categoria) => ({
    id: categoria.id_categoria,
    nombre: categoria.nombre,
    imagen_url: categoria.imagen_url, // <-- Añadido
    productos: categoria.productos.map((producto) => ({
      id: producto.id_producto,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      imagen_url: producto.imagen_url, // <-- Añadido
      ProductoTraduccion:
        producto.ProductoTraduccion?.map((traduccion) => ({
          id: traduccion.id_traduccion,
          nombre: traduccion.nombre,
          descripcion: traduccion.descripcion,
        })) ?? [],
    })),
  }))
}

// Normaliza para que descripcion nunca sea null y añade imagen_url
function normalizarCategorias(
  categorias: {
    id: number
    nombre: string
    imagen_url?: string
    productos: {
      id: number
      nombre: string
      descripcion: string | null
      precio: number
      imagen_url?: string
      ProductoTraduccion: {
        id: number
        nombre: string
        descripcion: string | null
      }[]
    }[]
  }[]
) {
  return categorias.map((cat) => ({
    id_categoria: cat.id,
    nombre: cat.nombre,
    imagen_url: cat.imagen_url,
    productos: cat.productos.map((prod) => ({
      id_producto: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion ?? undefined,
      precio: prod.precio,
      imagen_url: prod.imagen_url,
      ProductoTraduccion: prod.ProductoTraduccion.map((tr) => ({
        nombre: tr.nombre,
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
