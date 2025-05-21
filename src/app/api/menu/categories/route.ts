import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createCategorySchema } from '@/schemas/category'
import { categoryService } from '@/services/category-service'
import { jsonOk, jsonError } from '@/utils/api'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return jsonError('Unauthorized', 401)

    const categories = await categoryService.getAllCategories(
      session.user.establishment_id
    )
    return jsonOk({ categories })
  } catch (error) {
    return jsonError(error.message)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return jsonError('Unauthorized', 401)

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    const category = await categoryService.createCategory({
      ...validatedData,
      establishment_id: session.user.establishment_id
    })
    return jsonOk({ category })
  } catch (error) {
    return jsonError(error.message)
  }
}
