// src/services/order-service.ts
import { prisma } from '../lib/prisma';
import type { Order, OrderItem, OrderStatusHistory } from '@prisma/client';
import type { CreateOrderDTO, UpdateOrderDTO, UpdateOrderStatusDTO, CreateOrderItemDTO, UpdateOrderItemStatusDTO } from '../types/dtos/order';
import { OrderStatus, OrderItemStatus } from '../types/enums'; // Necesario para validación/lógica

export const orderService = {
  async createOrder(data: CreateOrderDTO, userIdMakingChange?: number): Promise<Order> {
    const { items, ...orderData } = data;

    // Obtener precios de variantes desde la BD para seguridad y consistencia
    const variantIds = items.map(item => item.variantId);
    const variantsFromDb = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true },
    });

    const variantPriceMap = new Map(variantsFromDb.map(v => [v.id, v.price]));

    let calculatedTotalAmount = 0;

    const orderItemsData = items.map(item => {
      const price = variantPriceMap.get(item.variantId);
      if (!price) {
        throw new Error(`Variant with ID ${item.variantId} not found or price missing.`);
      }
      const itemTotal = Number(price) * item.quantity;
      calculatedTotalAmount += itemTotal;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price, // Usar precio de la BD
        // itemTotalPrice se genera en la BD
        status: OrderItemStatus.PENDING,
        notes: item.notes,
      };
    });

    // La función de trigger `update_order_total` en la BD recalculará esto,
    // pero es bueno tener una estimación o validación aquí.
    // Para la creación inicial, la DB también tiene un default de 0.00 para total_amount,
    // y el trigger lo actualizará post-inserción de items.

    return prisma.order.create({
      data: {
        ...orderData,
        // totalAmount: calculatedTotalAmount, // El trigger de BD se encargará
        items: {
          create: orderItemsData,
        },
        // El trigger `log_initial_order_status` se encarga de crear el primer historial.
        // Si quisiéramos pasar el userId explícitamente para ese trigger:
        // No es directamente posible sin modificar el trigger, ya que toma client_user_id.
        // Si userIdMakingChange es diferente del client_user_id,
        // se podría añadir una entrada de historial adicional manualmente aquí si es necesario.
      },
      include: {
        items: { include: { variant: { include: { translations: true, product: { include: { translations: true } } } } } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
        client: true,
        waiter: true,
        establishment: true,
      },
    });
  },

  async getOrderById(orderId: number): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                translations: true, // Considerar filtrar por idioma
                product: { include: { translations: true } }, // Considerar filtrar por idioma
              },
            },
          },
          orderBy: { id: 'asc' }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: { changedBy: { select: { id: true, name: true, role: true } } },
        },
        client: { select: { id: true, name: true, email: true } },
        waiter: { select: { id: true, name: true, email: true } },
        establishment: { select: { id: true, name: true } },
      },
    });
  },

  async getOrdersByEstablishment(
    establishmentId: number,
    options?: { status?: OrderStatus[], clientUserId?: number, waiterUserId?: number, dateFrom?: Date, dateTo?: Date, page?: number, limit?: number }
  ): Promise<{ orders: Order[], totalCount: number }> {
    const { page = 1, limit = 10, ...filters } = options || {};
    const whereClause = {
      establishmentId,
      status: filters.status ? { in: filters.status } : undefined,
      clientUserId: filters.clientUserId,
      waiterUserId: filters.waiterUserId,
      createdAt: {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      }
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: { select: { id: true, variant: {select: {variantDescription: true, product: {select: {name: true}}}}, quantity: true, itemTotalPrice: true, status: true } }, // Resumido
        client: { select: { name: true } },
        waiter: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalCount = await prisma.order.count({ where: whereClause });
    return { orders, totalCount };
  },

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusDTO, changedByUserId?: number): Promise<Order | null> {
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: data.status,
          // updatedAt se actualiza por trigger
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          status: data.status,
          changedByUserId: changedByUserId, // ID del usuario que realiza el cambio (waiter, cook, admin)
          notes: data.notes,
        },
      });
      return updatedOrder; // Podrías devolver el pedido completo con includes aquí si lo necesitas
    });
  },

  async updateOrderItemStatus(orderItemId: number, data: UpdateOrderItemStatusDTO, changedByUserId?: number): Promise<OrderItem | null> {
    // Nota: No hay un historial de estado para OrderItem en el schema actual.
    // Si se quisiera, se debería añadir una tabla similar a OrderStatusHistory.
    // El usuario `changedByUserId` aquí es informativo, no se guarda directamente en OrderItem.
    return prisma.orderItem.update({
        where: { id: orderItemId },
        data: {
            status: data.status,
            notes: data.notes, // Asumiendo que quieres actualizar las notas del item con esta acción
        }
    });
  },

  async updateOrder(orderId: number, data: UpdateOrderDTO, changedByUserId?: number): Promise<Order | null> {
    const { items, status, ...orderData } = data;
    // La actualización de ítems es compleja: añadir nuevos, modificar existentes, eliminar.
    // Aquí una implementación simplificada.
    // Si el estado cambia, también se debe registrar en el historial.

    return prisma.$transaction(async (tx) => {
        const currentOrder = await tx.order.findUnique({ where: {id: orderId }});
        if (!currentOrder) throw new Error("Order not found");

        const updatedOrder = await tx.order.update({
            where: {id: orderId},
            data: {
                ...orderData,
                ...(status && status !== currentOrder.status ? { status: status } : {})
            }
        });

        if (status && status !== currentOrder.status) {
             await tx.orderStatusHistory.create({
                data: {
                  orderId: orderId,
                  status: status,
                  changedByUserId: changedByUserId,
                  notes: `Order details updated. Status changed to ${status}.`,
                },
              });
        }

        if (items) {
            // Lógica para manejar adición, actualización y eliminación de items
            // Esto requeriría comparar `items` con los existentes y realizar operaciones CUD.
            // Por simplicidad, este ejemplo no implementa la lógica completa de diff de items.
            // Se podría requerir que los items en la DTO tengan un `id` para los existentes
            // y que los nuevos no lo tengan. Los que falten se podrían eliminar.
            console.warn("Updating order items logic needs to be fully implemented for add/update/delete operations.");
        }
        // El trigger de la base de datos `update_order_total` se encargará de recalcular el total si los items cambian.

        return tx.order.findUnique({
            where: { id: orderId },
            include: { items: true, statusHistory: true, client: true, waiter: true }
        });
    });
  },

  async addItemToOrder(orderId: number, itemData: CreateOrderItemDTO): Promise<OrderItem | null> {
  const variant = await prisma.productVariant.findUnique({ where: { id: itemData.variantId }});
  if (!variant) throw new Error(`Variant ${itemData.variantId} not found.`);
  if (typeof itemData.quantity !== 'number' || itemData.quantity <= 0) {
    throw new Error('Quantity must be a positive number.');
  }
  return prisma.orderItem.create({
    data: {
      orderId,
      variantId: itemData.variantId,
      quantity: itemData.quantity,
      unitPrice: variant.price,
      status: OrderItemStatus.PENDING,
      notes: itemData.notes,
    },
  });
},

  async updateOrderItem(orderItemId: number, data: { quantity?: number, notes?: string }): Promise<OrderItem | null> {
      const item = await prisma.orderItem.findUnique({ where: {id: orderItemId}, select: { unitPrice: true }});
      if (!item) throw new Error("Order item not found.");

      // No permitir cambiar variantId o unitPrice directamente aquí para mantener integridad.
      // unitPrice podría recalcularse si la lógica de negocio lo permite (e.g. cambio de variante)
      // pero es más seguro manejar eso con borrado y adición.

      return prisma.orderItem.update({
          where: {id: orderItemId},
          data: {
              quantity: data.quantity,
              notes: data.notes,
              // itemTotalPrice es generado y se actualizará por trigger
          }
      });
  },

  async removeOrderItem(orderItemId: number): Promise<OrderItem | null> {
      return prisma.orderItem.delete({
          where: {id: orderItemId}
          // El trigger `update_order_total` en OrderItems actualizará Order.totalAmount
      });
  }

};
