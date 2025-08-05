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
  establishment_id?: number;
  client_user_id?: number;
  waiter_user_id?: number;
  from_date?: string;
  to_date?: string;
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
      created_at: order.created_at?.toISOString() || null,
      updated_at: order.updated_at?.toISOString() || null,
      total_amount: order.total_amount ? parseFloat(order.total_amount.toString()) : 0, // Default to 0 instead of null
      order_items: order.order_items ? order.order_items.map((item: OrderItem) => ({
        ...item,
        unit_price: parseFloat(item.unit_price.toString())
      })) : [],
      status_history: order.order_status_history ? order.order_status_history.map((history: OrderStatusHistory) => ({
        ...history,
        changed_at: history.changed_at?.toISOString() || null
      })) : [],
    };
  }

  // Crear un nuevo pedido
  public async createOrder(data: OrderCreateDTO): Promise<OrderResponseDTO> {
    create_order_schema.parse(data);

    const { order_items, ...orderData } = data;

    // Ensure total_amount is not null and convert to Decimal if needed
    const cleanOrderData = {
      ...orderData,
      status: orderData.status || OrderStatus.pending,
      total_amount: orderData.total_amount || 0, // Default to 0 if undefined
    };

    const newOrder = await prisma.order.create({
      data: cleanOrderData,
      include: this.orderInclude,
    });

    // Crear ítems de orden si existen
    if (order_items && order_items.length > 0) {
      await prisma.orderItem.createMany({
        data: order_items.map(item => ({
          ...item,
          order_id: newOrder.order_id,
        })),
      });
    }

    // Crear historial de estado
    await prisma.orderStatusHistory.create({
      data: {
        order_id: newOrder.order_id,
        status: orderData.status || OrderStatus.pending,
        changed_by_user_id: orderData.client_user_id,
        notes: 'Order created',
      },
    });

    // Obtener la orden completa con todos los datos
    const completeOrder = await prisma.order.findUnique({
      where: { order_id: newOrder.order_id },
      include: this.orderInclude,
    });

    return this.mapToDTO(completeOrder!);
  }

  // Obtener pedido por ID
  public async getOrderById(order_id: number): Promise<OrderResponseDTO | null> {
    order_id_schema.parse({ order_id }); // Validar ID

    const order = await prisma.order.findUnique({
      where: { order_id },
      include: this.orderInclude,
    });

    return order ? this.mapToDTO(order) : null;
  }

  // Obtener todos los pedidos
  // Modificar getAllOrders para aceptar filtros opcionales
  // Corregir getAllOrders con tipo específico para filtros
  public async getAllOrders(filters?: OrderFilters): Promise<OrderResponseDTO[]> {
    const orders = await prisma.order.findMany({
      include: this.orderInclude,
      where: filters ? {
        // Aplicar filtros si se proporcionan
        ...(filters.status && { status: filters.status }),
        ...(filters.establishment_id && { establishment_id: filters.establishment_id }),
        ...(filters.client_user_id && { client_user_id: filters.client_user_id }),
        ...(filters.waiter_user_id && { waiter_user_id: filters.waiter_user_id })
      } : undefined,
      orderBy: { created_at: 'desc' }
    });
    return orders.map(order => this.mapToDTO(order));
  }

  // Actualizar un pedido existente
  public async updateOrder(order_id: number, data: OrderUpdateDTO): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id });
    update_order_schema.parse(data);

    const { order_items, status, ...orderData } = data;

    // Filtrar campos undefined para evitar conflictos con Prisma
    const cleanOrderData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    );

    const updatedOrder = await prisma.order.update({
      where: { order_id },
      data: cleanOrderData,
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
          data: order_items.map((item: OrderItemCreateDTO) => ({ // Tipar explícitamente el parámetro item
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
    order_id_schema.parse({ order_id }); // Validar ID

    await prisma.order.delete({
      where: { order_id },
    });
  }

  // Añadir un ítem a un pedido existente
  public async addOrderItem(order_id: number, itemData: OrderItemCreateDTO): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id });
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

    // Convertir Decimal a number para cumplir con OrderItemDTO
    return {
      ...updatedItem,
      unit_price: parseFloat(updatedItem.unit_price.toString()),
    };
  }

  // Eliminar un ítem de pedido
  public async deleteOrderItem(order_item_id: number): Promise<void> {
    await prisma.orderItem.delete({
      where: { order_item_id },
    });
  }

  // Actualizar el estado de un pedido
  public async updateOrderStatus(order_id: number, newStatus: OrderStatus, changed_by_user_id?: number | null, notes?: string): Promise<OrderResponseDTO> {
    order_id_schema.parse({ order_id });

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
    order_id_schema.parse({ order_id });

    const history = await prisma.orderStatusHistory.findMany({
      where: { order_id },
      orderBy: { changed_at: Prisma.SortOrder.asc },
    });

    return history.map(h => ({ ...h }));
  }
}

// EXPORTACIÓN PRINCIPAL
export const orderService = new OrderService();
export default orderService;
