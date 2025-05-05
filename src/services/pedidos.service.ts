import prisma from '@/lib/prisma'

export async function obtenerPedidoPorId(orderId: number) {
    return prisma.order.findUnique({
        where: { order_id: orderId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                            translations: true
                        }
                    }
                },
            },
            status_history: true,
            client: true,
            waiter: true
        },
    })
}

export async function crearPedido(data: {
    establishment_id: number
    client_user_id?: number
    items: {
        variant_id: number
        quantity: number
        unit_price: number
        notes?: string
    }[]
    notes?: string
}) {
    return prisma.order.create({
        data: {
            establishment_id: data.establishment_id,
            client_user_id: data.client_user_id,
            items: {
                create: data.items.map(item => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    notes: item.notes
                }))
            },
            notes: data.notes,
            status: 'PENDING',
        },
        include: {
            items: true
        }
    })
}
