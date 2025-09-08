import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/middleware/auth-middleware'
import { jsonError } from '@/utils/api'
import { allergenService } from '@/services/allergen.service'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    await requireAuth()
    paramsSchema.parse(await paramsPromise)
    const allergens = await allergenService.getAllAllergens()
    return NextResponse.json(allergens)
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
