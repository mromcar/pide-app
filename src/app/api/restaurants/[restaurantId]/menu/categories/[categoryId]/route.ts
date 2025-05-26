//src/app/api/categories/[categoryId]/route.ts
import { requireAuth } from "@/middleware/auth-middleware"
import { updateCategory, deleteCategory } from "@/services/category-service"
import { updateCategorySchema } from "@/schemas/category"
import { jsonOk, jsonError } from "@/utils/api"

export async function PUT(
  request: Request,
  { params }: { params: { restaurantId: string, categoryId: string } }
) {
  try {
    await requireAuth('ADMIN')
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    const category = await updateCategory(
      Number(params.categoryId),
      Number(params.restaurantId),
      validatedData
    )
    return jsonOk({ category })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error))
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { restaurantId: string, categoryId: string } }
) {
  try {
    await requireAuth('ADMIN')
    await deleteCategory(
      Number(params.categoryId),
      Number(params.restaurantId)
    )
    return jsonOk({ message: 'Category deleted successfully' })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error))
  }
}
