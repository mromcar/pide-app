// src/services/orderServices.ts
import { CreateOrderDTO } from '@/types/dtos'; // Asegúrate de que CreateOrderDTO se infiera correctamente de Zod
import { SerializedOrder } from '@/types/order'; // Define este tipo si aún no lo tienes

export async function createClientOrder(orderData: CreateOrderDTO): Promise<SerializedOrder> {
  try {
    const response = await fetch('/api/client/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || 'Failed to create order');
    }

    const createdOrder: SerializedOrder = await response.json();
    return createdOrder;
  } catch (error) {
    console.error('Error creating client order:', error);
    if (error instanceof Error) {
        throw new Error(`Error al crear el pedido: ${error.message}`);
    }
    throw new Error('Error desconocido al crear el pedido.');
  }
}

// Puedes añadir otras funciones de servicio aquí si son necesarias
// Por ejemplo, para obtener el historial de pedidos si tienes un endpoint para clientes
// export async function fetchClientOrderHistory(clientId: number): Promise<SerializedOrder[]> { ... }
