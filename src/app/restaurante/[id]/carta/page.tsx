import '@/app/globals.css'
import { Decimal } from '@prisma/client'
import {
  obtenerCategoriasConProductos,
  obtenerEstablecimientoPorId,
} from '@/services/productos.service'
import CartaCliente from './CartaCliente'

// Define the type that CartaCliente expects
type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string // undefined instead of null
  orden: number
  id_establecimiento: number
  productos: {
    id_producto: number
    nombre: string
    descripcion?: string
    precio: number
    imagen_url?: string
    orden: number
    id_categoria: number
    id_establecimiento: number
    ProductoTraduccion: {
      id_traduccion: number
      idioma: string
      nombre: string
      descripcion?: string
    }[]
  }[]
}

type ProductoTraduccion = {
  id_traduccion: number
  idioma: string
  nombre: string
  descripcion?: string
}

type Producto = {
  id_producto: number
  nombre: string
  descripcion?: string
  precio: Decimal
  imagen_url?: string
  orden: number | null
  id_categoria: number
  id_establecimiento: number
  ProductoTraduccion: ProductoTraduccion[]
}

type CategoriaConProductosPrisma = {
  id_categoria: number
  nombre: string
  imagen_url: string | null
  orden: number | null
  id_establecimiento: number
  productos: Producto[]
}

// Update serializarCategorias to match CategoriaConProductosPrisma
function serializarCategorias(categorias: CategoriaConProductosPrisma[]) {
  return categorias.map(
    (categoria): Categoria => ({
      id_categoria: categoria.id_categoria,
      nombre: categoria.nombre,
      imagen_url: categoria.imagen_url ?? undefined,
      orden: categoria.orden ?? 0,
      id_establecimiento: categoria.id_establecimiento,
      productos: categoria.productos.map((producto) => ({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? undefined,
        precio: Number(producto.precio),
        imagen_url: producto.imagen_url ?? undefined,
        orden: producto.orden ?? 0,
        id_categoria: producto.id_categoria,
        id_establecimiento: producto.id_establecimiento,
        ProductoTraduccion: producto.ProductoTraduccion.map((traduccion) => ({
          id_traduccion: traduccion.id_traduccion,
          idioma: traduccion.idioma,
          nombre: traduccion.nombre,
          descripcion: traduccion.descripcion ?? undefined,
        })),
      })),
    })
  )
}

// Update normalizarCategorias to return Categoria[]
function normalizarCategorias(categorias: Categoria[]): Categoria[] {
  return categorias.map((cat) => ({
    ...cat,
    imagen_url: cat.imagen_url ?? undefined, // ensure undefined instead of null
    productos: cat.productos.map((prod) => ({
      ...prod,
      descripcion: prod.descripcion ?? undefined,
      imagen_url: prod.imagen_url ?? undefined,
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
  const categoriasConProductos = categoriasNormalizadas.filter(
    (cat) => cat.productos && cat.productos.length > 0
  )

  if (categoriasConProductos.length === 1) {
    return (
      <CartaCliente
        restaurante={restaurante}
        categorias={categoriasConProductos}
        idioma={idioma}
        mostrarProductosDeCategoriaId={categoriasConProductos[0].id_categoria}
      />
    )
  }

  return (
    <CartaCliente restaurante={restaurante} categorias={categoriasConProductos} idioma={idioma} />
  )
}
