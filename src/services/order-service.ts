// src/services/order-service.ts
import { prisma } from '../lib/prisma';
import type { Order, OrderItem, OrderStatusHistory } from '@prisma/client';
import type {
  CreateOrderDTO,
  UpdateOrderDTO,
  UpdateOrderStatusDTO,
  CreateOrderItemDTO,
  UpdateOrderItemStatusDTO
} from '../types/dtos/order';
import { OrderStatus, OrderItemStatus } from '../types/enums';

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
        unitPrice: price,
        status: item.status || OrderItemStatus.PENDING,
        notes: item.notes,
      };
    });

    return prisma.order.create({
      data: {
        ...orderData, // camelCase aquí
        items: {
          create: orderItemsData,
        },
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
                translations: true,
                product: { include: { translations: true } },
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
    options?: { status?: OrderStatus[], clientId?: number, waiterId?: number, dateFrom?: Date, dateTo?: Date, page?: number, limit?: number }
  ): Promise<{ orders: Order[], totalCount: number }> {
    const { page = 1, limit = 10, ...filters } = options || {};
    const whereClause = {
      establishmentId,
      status: filters.status ? { in: filters.status } : undefined,
      clientId: filters.clientId,
      waiterId: filters.waiterId,
      createdAt: {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      }
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: { select: { id: true, variant: { select: { variantDescription: true, product: { select: { name: true } } } }, quantity: true, unitPrice: true, status: true } },
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
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: data.status,
          changedByUserId,
          notes: data.notes,
        },
      });
      return updatedOrder;
    });
  },

  async updateOrderItemStatus(orderItemId: number, data: UpdateOrderItemStatusDTO, changedByUserId?: number): Promise<OrderItem | null> {
    return prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status: data.status,
        notes: data.notes,
      }
    });
  },

  async updateOrder(orderId: number, data: UpdateOrderDTO, changedByUserId?: number): Promise<Order | null> {
    const { items, status, ...orderData } = data;

    return prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
      if (!currentOrder) throw new Error("Order not found");

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...orderData,
          ...(status && status !== currentOrder.status ? { status: status } : {})
        }
      });

      if (status && status !== currentOrder.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status: status,
            changedByUserId,
            notes: `Order details updated. Status changed to ${status}.`,
          },
        });
      }

      // Aquí deberías implementar la lógica para actualizar los items si es necesario

      return tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, statusHistory: true, client: true, waiter: true }
      });
    });
  },

  async addItemToOrder(orderId: number, itemData: CreateOrderItemDTO): Promise<OrderItem | null> {
    const variant = await prisma.productVariant.findUnique({ where: { id: itemData.variantId } });
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
        status: itemData.status || OrderItemStatus.PENDING,
        notes: itemData.notes,
      },
    });
  },

  async updateOrderItem(orderItemId: number, data: { quantity?: number, notes?: string }): Promise<OrderItem | null> {
    const item = await prisma.orderItem.findUnique({ where: { id: orderItemId }, select: { unitPrice: true } });
    if (!item) throw new Error("Order item not found.");

    return prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        quantity: data.quantity,
        notes: data.notes,
      }
    });
  },

  async removeOrderItem(orderItemId: number): Promise<OrderItem | null> {
    return prisma.orderItem.delete({
      where: { id: orderItemId }
    });
  }
};
