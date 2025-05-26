//src/app/api/client/orders/[orderId]/route.ts

import { requireAuth } from "@/middleware/auth-middleware"
import { getAllCategories, createCategory } from "@/services/category-service"
import { createCategorySchema } from "@/schemas/category"
import { jsonOk, jsonError } from "@/utils/api"

export async function GET(_req: Request, { params }: { params: { restaurantId: string } }) {
  try {
    await requireAuth()
    const categories = await getAllCategories(Number(params.restaurantId))
    return jsonOk({ categories })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error))
  }
}

export async function POST(request: Request, { params }: { params: { restaurantId: string } }) {
  try {
    await requireAuth('ADMIN')
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    const category = await createCategory({
      ...validatedData,
      establishment_id: Number(params.restaurantId)
    })
    return jsonOk({ category })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error))
  }
}
