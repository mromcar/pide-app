import { requireAuth } from "@/middleware/auth-middleware"
import { orderService } from "@/services/order-service"
import { updateOrderStatusSchema } from "@/schemas/order"
import { jsonOk, jsonError } from "@/utils/api-responses"

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await requireAuth('EMPLOYEE')
    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)

    const order = await orderService.updateOrderStatus(
      Number(params.orderId),
      session.user.establishment_id,
      validatedData,
      session.user.id
    )
    return jsonOk({ order })
  } catch (error) {
    return jsonError(error.message)
  }
}
