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
  orderIdSchema,
  createOrderSchema,
  updateOrderSchema
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
    orderItems: true,
    statusHistory: {
      orderBy: { changedAt: Prisma.SortOrder.asc },
    },
  };

  // Helper para mapear Order a OrderResponseDTO
  private mapToDTO(order: Order & { orderItems?: OrderItem[]; statusHistory?: OrderStatusHistory[] }): OrderResponseDTO {
    return {
      ...order,
      createdAt: order.createdAt?.toISOString() || null,
      updatedAt: order.updatedAt?.toISOString() || null,
      totalAmount: order.totalAmount ? parseFloat(order.totalAmount.toString()) : 0,
      orderItems: order.orderItems ? order.orderItems.map((item: OrderItem) => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice.toString())
      })) : [],
      statusHistory: order.statusHistory ? order.statusHistory.map((history: OrderStatusHistory) => ({
        ...history,
        changedAt: history.changedAt?.toISOString() || null
      })) : [],
    };
  }

  // Crear un nuevo pedido
  public async createOrder(data: OrderCreateDTO): Promise<OrderResponseDTO> {
    createOrderSchema.parse(data);

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
          orderId: newOrder.orderId,
        })),
      });
    }

    await prisma.orderStatusHistory.create({
      data: {
        orderId: newOrder.orderId,
        status: orderData.status || OrderStatus.pending,
        changedByUserId: orderData.clientUserId,
        notes: 'Order created',
      },
    });

    const completeOrder = await prisma.order.findUnique({
      where: { orderId: newOrder.orderId },
      include: this.orderInclude,
    });

    return this.mapToDTO(completeOrder!);
  }

  // Obtener pedido por ID
  public async getOrderById(orderId: number): Promise<OrderResponseDTO | null> {
    orderIdSchema.parse({ orderId });

    const order = await prisma.order.findUnique({
      where: { orderId },
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
        ...(filters.establishmentId && { establishmentId: filters.establishmentId }),
        ...(filters.clientUserId && { clientUserId: filters.clientUserId }),
        ...(filters.waiterUserId && { waiterUserId: filters.waiterUserId })
      } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return orders.map(order => this.mapToDTO(order));
  }

  // Actualizar un pedido existente
  public async updateOrder(orderId: number, data: OrderUpdateDTO): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ orderId });
    updateOrderSchema.parse(data);

    const { orderItems, status, ...orderData } = data;

    const cleanOrderData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    );

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: cleanOrderData,
      include: this.orderInclude,
    });

    if (orderItems !== undefined) {
      await prisma.orderItem.deleteMany({
        where: { orderId },
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
      where: { orderId },
      include: this.orderInclude,
    });

    if (!finalOrder) {
      throw new Error(`Order with ID ${orderId} not found after update.`);
    }

    return this.mapToDTO(finalOrder);
  }

  // Eliminar un pedido
  public async deleteOrder(orderId: number): Promise<void> {
    orderIdSchema.parse({ orderId });
    await prisma.order.delete({
      where: { orderId },
    });
  }

  // Añadir un ítem a un pedido existente
  public async addOrderItem(orderId: number, itemData: OrderItemCreateDTO): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ orderId });
    orderItemCreateSchema.parse(itemData);

    await prisma.orderItem.create({
      data: {
        ...itemData,
        orderId,
      },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { orderId },
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
      where: { orderItemId },
      data: itemData,
    });

    return {
      ...updatedItem,
      unitPrice: parseFloat(updatedItem.unitPrice.toString()),
    };
  }

  // Eliminar un ítem de pedido
  public async deleteOrderItem(orderItemId: number): Promise<void> {
    await prisma.orderItem.delete({
      where: { orderItemId },
    });
  }

  // Actualizar el estado de un pedido
  public async updateOrderStatus(orderId: number, newStatus: OrderStatus, changedByUserId?: number | null, notes?: string): Promise<OrderResponseDTO> {
    orderIdSchema.parse({ orderId });

    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    if (order.status === newStatus) {
      return this.mapToDTO(order);
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
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
    orderIdSchema.parse({ orderId });

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: Prisma.SortOrder.asc },
    });

    return history.map(h => ({
      ...h,
      changedAt: h.changedAt?.toISOString() || null,
    }) as OrderStatusHistoryDTO);
  }
}

// EXPORTACIÓN PRINCIPAL
export const orderService = new OrderService();
export default orderService;
