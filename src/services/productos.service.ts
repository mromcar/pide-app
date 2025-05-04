import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function obtenerCategoriasConProductos(
  restauranteId: number,
  idioma: string
) {
  return prisma.categoria.findMany({
    where: { id_establecimiento: restauranteId },
    select: {
      id_categoria: true,
      nombre: true,
      imagen_url: true,
      productos: {
        select: {
          id_producto: true,
          nombre: true,
          descripcion: true,
          precio: true,
          imagen_url: true,
          orden: true,
          ProductoTraduccion: {
            where: { idioma },
            select: {
              id_traduccion: true,
              nombre: true,
              descripcion: true,
              idioma: true,
            },
          },
        },
        orderBy: { orden: 'asc' },
      },
    },
    orderBy: { orden: 'asc' },
  })
}

export async function obtenerEstablecimientoPorId(restauranteId: number) {
  return prisma.establecimiento.findUnique({
    where: { id_establecimiento: restauranteId },
  })
}

export type ProductoTraduccion = {
  nombre: string
  descripcion: string | null
  idioma: string
  id_traduccion: number
}

export type ProductoConTraduccion = {
  id_producto: number
  nombre: string
  descripcion: string | null
  precio: string | number
  imagen_url?: string // <-- Añadido
  orden?: number
  ProductoTraduccion: ProductoTraduccion[]
}

export type CategoriaConProductos = {
  id_categoria: number
  nombre: string
  imagen_url?: string // <-- Añadido
  productos: ProductoConTraduccion[]
}
