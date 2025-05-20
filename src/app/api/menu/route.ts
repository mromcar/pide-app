import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonOk, jsonError } from '@/utils/api'
import {
  getCategoriesWithProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProduct,
  deleteProduct
} from '@/services/menu-services'
import { serializeCategory, serializeResponse } from '@/utils/serializers'
import type { LanguageCode } from '@/constants/languages'
import {
  createCategorySchema,
  updateCategorySchema,
  updateProductSchema,
  deleteSchema
} from '@/schemas/menu'

// Helper for number validation
function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw jsonError("Unauthorized", 401)
  return session
}

// Helper to get language with fallback
function getUserLanguage(session: any): LanguageCode {
  return session.user.language_code || 'es'
}

export async function GET() {
  try {
    const session = await requireSession()
    const language = getUserLanguage(session)

    const categories = await getCategoriesWithProducts(
      session.user.establishment_id,
      language
    )

    const serializedCategories = categories
      .map(category => serializeCategory(category, language))
      .sort((a, b) => a.sort_order - b.sort_order)

    return jsonOk(serializeResponse({ categories: serializedCategories }))
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError(e.message || "Internal error", 500)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const json = await request.json()

    const result = createCategorySchema.safeParse(json)
    if (!result.success) {
      return jsonError(result.error.message)
    }

    const category = await createCategory(
      session.user.establishment_id,
      result.data
    )
    return jsonOk(serializeResponse({ category }))
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError(e.message || "Internal error", 500)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession()
    const json = await request.json()

    const result = updateCategorySchema.safeParse(json)
    if (!result.success) {
      return jsonError(result.error.message)
    }

    const { category_id, ...data } = result.data
    const category = await updateCategory(
      session.user.establishment_id,
      category_id,
      data
    )
    return jsonOk(serializeResponse({ category }))
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError(e.message || "Internal error", 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession()
    const json = await request.json()

    const result = deleteSchema.safeParse(json)
    if (!result.success) {
      return jsonError(result.error.message)
    }

    if ('product_id' in result.data) {
      const response = await deleteProduct(session.user.establishment_id, result.data.product_id)
      return jsonOk(serializeResponse(response))
    }

    if ('category_id' in result.data) {
      const response = await deleteCategory(session.user.establishment_id, result.data.category_id)
      return jsonOk(serializeResponse(response))
    }

    return jsonError("Missing category_id or product_id")
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError(e.message || "Internal error", 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession()
    const json = await request.json()

    const result = updateProductSchema.safeParse(json)
    if (!result.success) {
      return jsonError(result.error.message)
    }

    const { product_id, ...data } = result.data
    const product = await updateProduct(
      session.user.establishment_id,
      product_id,
      data
    )
    return jsonOk(serializeResponse({ product }))
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError(e.message || "Internal error", 500)
  }
}
