import prisma from '@/lib/prisma'

export async function obtenerPedidoPorId(pedidoId: number) {
    return prisma.pedido.findUnique({
        where: { id_pedido: pedidoId },
        include: {
            detalles: {
                include: { producto: true },
            },
        },
    })
}
