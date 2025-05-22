//src/app/api/categories/[categoryId]/route.ts
import { requireAuth } from "@/middleware/auth-middleware"
import { categoryService } from "@/services/category-service"
import { updateCategorySchema } from "@/schemas/category"
import { jsonOk, jsonError } from "@/utils/api"

export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await requireAuth('ADMIN')
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    const category = await categoryService.updateCategory(
      Number(params.categoryId),
      session.user.establishment_id,
      validatedData
    )
    return jsonOk({ category })
  } catch (error) {
    return jsonError(error.message)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await requireAuth('ADMIN')
    await categoryService.deleteCategory(
      Number(params.categoryId),
      session.user.establishment_id
    )
    return jsonOk({ message: 'Category deleted successfully' })
  } catch (error) {
    return jsonError(error.message)
  }
}
