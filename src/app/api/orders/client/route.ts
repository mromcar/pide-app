import { requireAuth } from "@/middleware/auth-middleware"
import { orderService } from "@/services/order-service"
import { createOrderSchema } from "@/schemas/order"
import { jsonOk, jsonError } from "@/utils/api"

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    const order = await orderService.createOrder({
      ...validatedData,
      client_id: session.user.id,
      establishment_id: session.user.establishment_id
    })
    return jsonOk({ order })
  } catch (error) {
    return jsonError(error.message)
  }
}
