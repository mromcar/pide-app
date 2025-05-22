import { requireAuth } from "@/middleware/auth-middleware"
import { orderService } from "@/services/order-service"
import { jsonOk, jsonError } from "@/utils/api"

export async function GET(request: Request) {
  try {
    const session = await requireAuth('EMPLOYEE')
    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get('status'),
      fromDate: searchParams.get('fromDate'),
      toDate: searchParams.get('toDate'),
      establishment_id: session.user.establishment_id
    }

    const orders = await orderService.getAllOrders(filters)
    return jsonOk({ orders })
  } catch (error) {
    return jsonError(error.message)
  }
}
