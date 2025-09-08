import { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/middleware/auth-middleware'
import { jsonOk, jsonError } from '@/utils/api'
import { categoryUpsertSchema } from '@/schemas/menu'
import type { CategoryResponseDTO, TranslationUpsert } from '@/types/dtos/menu'
import type { CategoryDTO } from '@/types/dtos/category'
import type { CategoryTranslationDTO } from '@/types/dtos/categoryTranslation'
import { categoryService } from '@/services/category.service'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
})

function mapCategoryDTOToResponse(dto: CategoryDTO): CategoryResponseDTO {
  const translations: TranslationUpsert[] =
    (dto.translations ?? []).map((t: CategoryTranslationDTO) => ({
      languageCode: t.languageCode as TranslationUpsert['languageCode'],
      name: t.name,
      description: null,
    })) || []
  return {
    id: dto.categoryId,
    order: dto.sortOrder ?? 0,
    active: dto.isActive ?? true,
    translations,
  }
}

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    await requireAuth()
    const { establishmentId, categoryId } = paramsSchema.parse(await paramsPromise)
    const found = await categoryService.getCategoryById(categoryId)
    if (!found || found.establishmentId !== establishmentId) return jsonError('Category not found', 404)
    return jsonOk({ category: mapCategoryDTOToResponse(found) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    await requireAuth() // was: const session = await requireAuth()
    const { establishmentId, categoryId } = paramsSchema.parse(await paramsPromise)
    const validated = categoryUpsertSchema.parse(await req.json())

    const base = validated.translations.find(t => t.languageCode === 'es') ?? validated.translations[0]
    const updated = await categoryService.updateCategory(categoryId, {
      establishmentId,
      name: base.name,
      sortOrder: validated.order,
      isActive: validated.active,
      translations: validated.translations.map(t => ({ languageCode: t.languageCode, name: t.name })),
    })
    if (!updated) return jsonError('Failed to update category', 500)
    return jsonOk({ category: mapCategoryDTOToResponse(updated) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    await requireAuth()
    const { establishmentId, categoryId } = paramsSchema.parse(await paramsPromise)
    const deleted = await categoryService.deleteCategory(categoryId, establishmentId)
    if (!deleted) return jsonError('Failed to delete category', 500)
    return jsonOk({ ok: true })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
