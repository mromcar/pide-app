import { Order, OrderStatus, OrderItem, OrderStatusHistory, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderResponseDTO,
  OrderStatusHistoryDTO
} from '@/types/dtos/order';
import {
  OrderItemUpdateDTO,
  OrderItemCreateDTO,
  OrderItemDTO
} from '@/types/dtos/orderItem';
import {
  order_id_schema,
  create_order_schema,
  update_order_schema
} from '@/schemas/order';
import {
  orderItemCreateSchema,
  orderItemUpdateSchema
} from '@/schemas/orderItem';

// Definir tipo para filtros
interface OrderFilters {
  status?: OrderStatus;
  establishmentId?: number;
  clientUserId?: number;
  waiterUserId?: number;
  fromDate?: string;
  toDate?: string;
}

class OrderService {
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
      createdAt: order.created_at?.toISOString() || null,
      updatedAt: order.updated_at?.toISOString() || null,
      totalAmount: order.total_amount ? parseFloat(order.total_amount.toString()) : 0,
      orderItems: order.order_items ? order.order_items.map((item: OrderItem) => ({
        ...item,
        unitPrice: parseFloat(item.unit_price.toString())
      })) : [],
      statusHistory: order.order_status_history ? order.order_status_history.map((history: OrderStatusHistory) => ({
        ...history,
        changedAt: history.changed_at?.toISOString() || null
      })) : [],
    };
  }

  // Crear un nuevo pedido
  public async createOrder(data: OrderCreateDTO): Promise<OrderResponseDTO> {
    create_order_schema.parse(data);

    const { orderItems, ...orderData } = data;

    const cleanOrderData = {
      ...orderData,
      status: orderData.status || OrderStatus.pending,
      totalAmount: orderData.totalAmount || 0,
    };

    const newOrder = await prisma.order.create({
      data: cleanOrderData,
      include: this.orderInclude,
    });

    if (orderItems && orderItems.length > 0) {
      await prisma.orderItem.createMany({
        data: orderItems.map(item => ({
          ...item,
          orderId: newOrder.order_id,
        })),
      });
    }

    await prisma.orderStatusHistory.create({
      data: {
        orderId: newOrder.order_id,
        status: orderData.status || OrderStatus.pending,
        changedByUserId: orderData.clientUserId,
        notes: 'Order created',
      },
    });

    const completeOrder = await prisma.order.findUnique({
      where: { order_id: newOrder.order_id },
      include: this.orderInclude,
    });

    return this.mapToDTO(completeOrder!);
  }

  // Obtener pedido por ID
  public async getOrderById(orderId: number): Promise<OrderResponseDTO | null> {
    order_id_schema.parse({ order_id: orderId });

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: this.orderInclude,
    });

    return order ? this.mapToDTO(order) : null;
  }

  // Obtener todos los pedidos
  public async getAllOrders(filters?: OrderFilters): Promise<OrderResponseDTO[]> {
    const orders = await prisma.order.findMany({
      include: this.orderInclude,
      where: filters ? {
        ...(filters.status && { status: filters.status }),
        ...(filters.establishmentId && { establishment_id: filters.establishmentId }),
        ...(filters.clientUserId && { client_user_id: filters.clientUserId }),
        ...(filters.waiterUserId && { waiter_user_id: filters.waiterUserId })
      } : undefined,
      orderBy: { created_at: 'desc' }
    });
    return orders.map(order => this.mapToDTO(order));
  }

  // Actualizar un pedido existente
  public async updateOrder(orderId: number, data: OrderUpdateDTO): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id: orderId });
    update_order_schema.parse(data);

    const { orderItems, status, ...orderData } = data;

    const cleanOrderData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    );

    const updatedOrder = await prisma.order.update({
      where: { order_id: orderId },
      data: cleanOrderData,
      include: this.orderInclude,
    });

    if (orderItems !== undefined) {
      await prisma.orderItem.deleteMany({
        where: { order_id: orderId },
      });
      if (orderItems.length > 0) {
        await prisma.orderItem.createMany({
          data: orderItems.map((item: OrderItemCreateDTO) => ({
            ...item,
            orderId,
          })),
        });
      }
    }

    if (status && updatedOrder.status !== status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status,
          changedByUserId: data.waiterUserId || data.clientUserId,
          notes: `Status changed from ${updatedOrder.status} to ${status}`,
        },
      });
    }

    const finalOrder = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: this.orderInclude,
    });

    if (!finalOrder) {
      throw new Error(`Order with ID ${orderId} not found after update.`);
    }

    return this.mapToDTO(finalOrder);
  }

  // Eliminar un pedido
  public async deleteOrder(orderId: number): Promise<void> {
    order_id_schema.parse({ order_id: orderId });
    await prisma.order.delete({
      where: { order_id: orderId },
    });
  }

  // Añadir un ítem a un pedido existente
  public async addOrderItem(orderId: number, itemData: OrderItemCreateDTO): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id: orderId });
    orderItemCreateSchema.parse(itemData);

    await prisma.orderItem.create({
      data: {
        ...itemData,
        orderId,
      },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: this.orderInclude,
    });

    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    return this.mapToDTO(updatedOrder);
  }

  // Actualizar un ítem de pedido existente
  public async updateOrderItem(orderItemId: number, itemData: OrderItemUpdateDTO): Promise<OrderItemDTO> {
    orderItemUpdateSchema.parse(itemData);

    const updatedItem = await prisma.orderItem.update({
      where: { order_item_id: orderItemId },
      data: itemData,
    });

    return {
      ...updatedItem,
      unitPrice: parseFloat(updatedItem.unit_price.toString()),
    };
  }

  // Eliminar un ítem de pedido
  public async deleteOrderItem(orderItemId: number): Promise<void> {
    await prisma.orderItem.delete({
      where: { order_item_id: orderItemId },
    });
  }

  // Actualizar el estado de un pedido
  public async updateOrderStatus(orderId: number, newStatus: OrderStatus, changedByUserId?: number | null, notes?: string): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id: orderId });

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    if (order.status === newStatus) {
      return this.mapToDTO(order);
    }

    const updatedOrder = await prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: newStatus,
      },
      include: this.orderInclude,
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        changedByUserId,
        notes: notes || `Status changed from ${order.status} to ${newStatus}`,
      },
    });

    return this.mapToDTO(updatedOrder);
  }

  // Obtener historial de estado de un pedido
  public async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistoryDTO[]> {
    order_id_schema.parse({ order_id: orderId });

    const history = await prisma.orderStatusHistory.findMany({
      where: { order_id: orderId },
      orderBy: { changed_at: Prisma.SortOrder.asc },
    });

    return history.map(h => ({
      ...h,
      changedAt: h.changed_at?.toISOString() || null,
    }) as OrderStatusHistoryDTO);
  }
}

// EXPORTACIÓN PRINCIPAL
export const orderService = new OrderService();
export default orderService;
