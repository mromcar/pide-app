import { requireAuth } from "@/middleware/auth-middleware"
import { orderService } from "@/services/order-service"
import { jsonOk, jsonError } from "@/utils/api"

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await requireAuth()
    const order = await orderService.getOrderById(
      Number(params.orderId),
      session.user.establishment_id,
      session.user.id
    )
    return jsonOk({ order })
  } catch (error) {
    return jsonError(error.message)
  }
}
