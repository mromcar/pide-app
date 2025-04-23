import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function obtenerCategoriasConProductos(
  restauranteId: number,
  idioma: string
): Promise<
  Prisma.CategoriaGetPayload<{
    include: {
      productos: {
        include: {
          ProductoTraduccion: true
        }
      }
    }
  }>[]
> {
  return prisma.categoria.findMany({
    where: { id_establecimiento: restauranteId },
    include: {
      productos: {
        include: {
          ProductoTraduccion: {
            where: { idioma },
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
}

export type ProductoConTraduccion = {
    id_producto: number
    nombre: string
    descripcion: string | null
    precio: string | number
    ProductoTraduccion: ProductoTraduccion[]
}

export type CategoriaConProductos = {
    id_categoria: number
    nombre: string
    productos: ProductoConTraduccion[]
}
