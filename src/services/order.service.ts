import { PrismaClient, Order, OrderItem, OrderStatusHistory, Prisma, OrderStatus, OrderItemStatus } from '@prisma/client';
import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderResponseDTO,
} from '../types/dtos/order';
import {
  OrderItemCreateDTO,
  OrderItemUpdateDTO,
  OrderItemDTO
} from '../types/dtos/orderItem';
import {
  OrderStatusHistoryCreateDTO,
  OrderStatusHistoryDTO
} from '../types/dtos/orderStatusHistory';
import {
  orderCreateSchema,
  orderUpdateSchema,
  orderIdSchema
} from '../schemas/order';
import {
  orderItemCreateSchema,
  orderItemUpdateSchema
} from '../schemas/orderItem';
import {
  orderStatusHistoryCreateSchema
} from '../schemas/orderStatusHistory';
import { prisma } from '@/lib/prisma'; // O la ruta relativa correcta, ej: '../lib/prisma'


export class OrderService {
  private readonly orderInclude = {
    order_items: true,
    order_status_history: {
      orderBy: { changed_at: Prisma.SortOrder.asc },
    },
  };

  // Helper para mapear Order a OrderResponseDTO
  private mapToDTO(order: Order & { order_items?: OrderItem[]; order_status_history?: OrderStatusHistory[] }): OrderResponseDTO {
    return {
      ...order,
      order_items: order.order_items ? order.order_items.map((item: OrderItem) => ({ ...item })) : [], // Explicitly type item
      order_status_history: order.order_status_history ? order.order_status_history.map((history: OrderStatusHistory) => ({ ...history })) : [], // Explicitly type history
    };
  }

  // Crear un nuevo pedido
  public async createOrder(data: OrderCreateDTO): Promise<OrderResponseDTO> {
    orderCreateSchema.parse(data); // Validar input

    const { order_items, ...orderData } = data;

    const newOrder = await prisma.order.create({
      data: {
        ...orderData,
        status: orderData.status || OrderStatus.pending, // Corregido: Usar OrderStatus.pending
        order_items: {
          createMany: {
            data: order_items || [],
          },
        },
        order_status_history: {
          create: {
            status: orderData.status || OrderStatus.pending, // Corregido: Usar OrderStatus.pending
            changed_by_user_id: orderData.client_user_id, // Or a dedicated user for order creation
            notes: 'Order created',
          },
        },
      },
      include: this.orderInclude,
    });

    return this.mapToDTO(newOrder);
  }

  // Obtener pedido por ID
  public async getOrderById(order_id: number): Promise<OrderResponseDTO | null> {
    orderIdSchema.parse({ order_id }); // Validar ID

    const order = await prisma.order.findUnique({
      where: { order_id },
      include: this.orderInclude,
    });

    return order ? this.mapToDTO(order) : null;
  }

  // Obtener todos los pedidos
  public async getAllOrders(): Promise<OrderResponseDTO[]> {
    const orders = await prisma.order.findMany({
      include: this.orderInclude,
    });
    return orders.map(this.mapToDTO);
  }

  // Actualizar un pedido existente
  public async updateOrder(order_id: number, data: OrderUpdateDTO): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ order_id }); // Validar ID
    orderUpdateSchema.parse(data); // Validar input

    const { order_items, status, ...orderData } = data;

    const updatedOrder = await prisma.order.update({
      where: { order_id },
      data: orderData,
      include: this.orderInclude,
    });

    // Manejar ítems del pedido
    if (order_items !== undefined) {
      // Para simplificar, eliminamos y recreamos los ítems. En un caso real, se haría un upsert o un manejo más granular.
      await prisma.orderItem.deleteMany({
        where: { order_id },
      });
      if (order_items.length > 0) {
        await prisma.orderItem.createMany({
          data: order_items.map(item => ({
            ...item,
            order_id,
          })),
        });
      }
    }

    // Manejar historial de estado si el estado ha cambiado
    if (status && updatedOrder.status !== status) {
      await prisma.orderStatusHistory.create({
        data: {
          order_id,
          status,
          changed_by_user_id: data.waiter_user_id || data.client_user_id, // User who changed the status
          notes: `Status changed from ${updatedOrder.status} to ${status}`,
        },
      });
    }

    // Obtener el pedido actualizado con todos sus ítems y historial
    const finalOrder = await prisma.order.findUnique({
      where: { order_id },
      include: this.orderInclude,
    });

    if (!finalOrder) {
      throw new Error(`Order with ID ${order_id} not found after update.`);
    }

    return this.mapToDTO(finalOrder);
  }

  // Eliminar un pedido
  public async deleteOrder(order_id: number): Promise<void> {
    orderIdSchema.parse({ order_id }); // Validar ID

    await prisma.order.delete({
      where: { order_id },
    });
  }

  // Añadir un ítem a un pedido existente
  public async addOrderItem(order_id: number, itemData: OrderItemCreateDTO): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ order_id });
    orderItemCreateSchema.parse(itemData);

    await prisma.orderItem.create({
      data: {
        ...itemData,
        order_id,
      },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { order_id },
      include: this.orderInclude,
    });

    if (!updatedOrder) {
      throw new Error(`Order with ID ${order_id} not found.`);
    }

    return this.mapToDTO(updatedOrder);
  }

  // Actualizar un ítem de pedido existente
  public async updateOrderItem(order_item_id: number, itemData: OrderItemUpdateDTO): Promise<OrderItemDTO> {
    orderItemUpdateSchema.parse(itemData);

    const updatedItem = await prisma.orderItem.update({
      where: { order_item_id },
      data: itemData,
    });

    return updatedItem;
  }

  // Eliminar un ítem de pedido
  public async deleteOrderItem(order_item_id: number): Promise<void> {
    await prisma.orderItem.delete({
      where: { order_item_id },
    });
  }

  // Actualizar el estado de un pedido
  public async updateOrderStatus(order_id: number, newStatus: OrderStatus, changed_by_user_id?: number | null, notes?: string): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ order_id });

    const order = await prisma.order.findUnique({
      where: { order_id },
    });

    if (!order) {
      throw new Error(`Order with ID ${order_id} not found.`);
    }

    if (order.status === newStatus) {
      return this.mapToDTO(order); // No change needed
    }

    const updatedOrder = await prisma.order.update({
      where: { order_id },
      data: {
        status: newStatus,
      },
      include: this.orderInclude,
    });

    await prisma.orderStatusHistory.create({
      data: {
        order_id,
        status: newStatus,
        changed_by_user_id,
        notes: notes || `Status changed from ${order.status} to ${newStatus}`,
      },
    });

    return this.mapToDTO(updatedOrder);
  }

  // Obtener historial de estado de un pedido
  public async getOrderStatusHistory(order_id: number): Promise<OrderStatusHistoryDTO[]> {
    orderIdSchema.parse({ order_id });

    const history = await prisma.orderStatusHistory.findMany({
      where: { order_id },
      orderBy: { changed_at: Prisma.SortOrder.asc },
    });

    return history.map(h => ({ ...h }));
  }
}
