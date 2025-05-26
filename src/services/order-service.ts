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
import { toSnakeCase } from '@/utils/case';

export const orderService = {
  async createOrder(data: CreateOrderDTO, userIdMakingChange?: number): Promise<Order> {
    const { items, ...orderData } = data;

    // Obtener precios de variantes desde la BD para seguridad y consistencia
    const variantIds = items.map(item => item.variantId);
    const variantsFromDb = await prisma.product_variant.findMany({
      where: { variant_id: { in: variantIds } },
      select: { variant_id: true, price: true },
    });

    const variantPriceMap = new Map(variantsFromDb.map(v => [v.variant_id, v.price]));

    let calculatedTotalAmount = 0;

    const orderItemsData = items.map(item => {
      const price = variantPriceMap.get(item.variantId);
      if (!price) {
        throw new Error(`Variant with ID ${item.variantId} not found or price missing.`);
      }
      const itemTotal = Number(price) * item.quantity;
      calculatedTotalAmount += itemTotal;
      return {
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: price,
        status: item.status || OrderItemStatus.PENDING,
        notes: item.notes,
      };
    });

    return prisma.order.create({
      data: {
        ...toSnakeCase(orderData),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { variant: { include: { translations: true, product: { include: { translations: true } } } } } },
        status_history: { orderBy: { changed_at: 'asc' } },
        client: true,
        waiter: true,
        establishment: true,
      },
    });
  },

  async getOrderById(orderId: number): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { order_id: orderId },
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
          orderBy: { order_item_id: 'asc' }
        },
        status_history: {
          orderBy: { changed_at: 'desc' },
          include: { changed_by: { select: { user_id: true, name: true, role: true } } },
        },
        client: { select: { user_id: true, name: true, email: true } },
        waiter: { select: { user_id: true, name: true, email: true } },
        establishment: { select: { establishment_id: true, name: true } },
      },
    });
  },

  async getOrdersByEstablishment(
    establishmentId: number,
    options?: { status?: OrderStatus[], clientUserId?: number, waiterUserId?: number, dateFrom?: Date, dateTo?: Date, page?: number, limit?: number }
  ): Promise<{ orders: Order[], totalCount: number }> {
    const { page = 1, limit = 10, ...filters } = options || {};
    const whereClause = {
      establishment_id: establishmentId,
      status: filters.status ? { in: filters.status } : undefined,
      client_user_id: filters.clientUserId,
      waiter_user_id: filters.waiterUserId,
      created_at: {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      }
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: { select: { order_item_id: true, variant: { select: { variant_description: true, product: { select: { name: true } } } }, quantity: true, item_total_price: true, status: true } },
        client: { select: { name: true } },
        waiter: { select: { name: true } },
      },
      orderBy: {
        created_at: 'desc',
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
        where: { order_id: orderId },
        data: {
          status: data.status,
        },
      });

      await tx.order_status_history.create({
        data: {
          order_id: orderId,
          status: data.status,
          changed_by_user_id: changedByUserId,
          notes: data.notes,
        },
      });
      return updatedOrder;
    });
  },

  async updateOrderItemStatus(orderItemId: number, data: UpdateOrderItemStatusDTO, changedByUserId?: number): Promise<OrderItem | null> {
    return prisma.order_item.update({
      where: { order_item_id: orderItemId },
      data: {
        status: data.status,
        notes: data.notes,
      }
    });
  },

  async updateOrder(orderId: number, data: UpdateOrderDTO, changedByUserId?: number): Promise<Order | null> {
    const { items, status, ...orderData } = data;

    return prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { order_id: orderId } });
      if (!currentOrder) throw new Error("Order not found");

      const updatedOrder = await tx.order.update({
        where: { order_id: orderId },
        data: {
          ...toSnakeCase(orderData),
          ...(status && status !== currentOrder.status ? { status: status } : {})
        }
      });

      if (status && status !== currentOrder.status) {
        await tx.order_status_history.create({
          data: {
            order_id: orderId,
            status: status,
            changed_by_user_id: changedByUserId,
            notes: `Order details updated. Status changed to ${status}.`,
          },
        });
      }

      // Aquí deberías implementar la lógica para actualizar los items si es necesario

      return tx.order.findUnique({
        where: { order_id: orderId },
        include: { items: true, status_history: true, client: true, waiter: true }
      });
    });
  },

  async addItemToOrder(orderId: number, itemData: CreateOrderItemDTO): Promise<OrderItem | null> {
    const variant = await prisma.product_variant.findUnique({ where: { variant_id: itemData.variantId } });
    if (!variant) throw new Error(`Variant ${itemData.variantId} not found.`);
    if (typeof itemData.quantity !== 'number' || itemData.quantity <= 0) {
      throw new Error('Quantity must be a positive number.');
    }
    return prisma.order_item.create({
      data: {
        order_id: orderId,
        variant_id: itemData.variantId,
        quantity: itemData.quantity,
        unit_price: variant.price,
        status: itemData.status || OrderItemStatus.PENDING,
        notes: itemData.notes,
      },
    });
  },

  async updateOrderItem(orderItemId: number, data: { quantity?: number, notes?: string }): Promise<OrderItem | null> {
    const item = await prisma.order_item.findUnique({ where: { order_item_id: orderItemId }, select: { unit_price: true } });
    if (!item) throw new Error("Order item not found.");

    return prisma.order_item.update({
      where: { order_item_id: orderItemId },
      data: {
        quantity: data.quantity,
        notes: data.notes,
      }
    });
  },

  async removeOrderItem(orderItemId: number): Promise<OrderItem | null> {
    return prisma.order_item.delete({
      where: { order_item_id: orderItemId }
    });
  }
};
