import prisma from '@/lib/prisma'

export async function obtenerCategoriasConProductos(restauranteId: number, idioma: string) {
    return prisma.categoria.findMany({
        where: { id_establecimiento: restauranteId },
        include: {
            productos: {
                include: {
                    traducciones: {
                        where: { idioma },
                    },
                },
            },
        },
        orderBy: { id_categoria: 'asc' },
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
}

export type ProductoConTraducciones = {
    id_producto: number
    nombre: string
    descripcion: string | null
    precio: any
    traducciones: ProductoTraduccion[]
}

export type CategoriaConProductos = {
    id_categoria: number
    nombre: string
    productos: ProductoConTraducciones[]
}
