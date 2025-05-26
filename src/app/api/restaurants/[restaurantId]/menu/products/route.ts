//src/app/api/products/route.ts

import { requireAuth } from "@/middleware/auth-middleware"
import { productService } from "@/services/product-service"
import { createProductSchema } from "@/schemas/product"
import { jsonOk, jsonError } from "@/utils/api"

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('lang') || 'es'

    const products = await productService.getAllProducts(
      session.user.establishment_id,
      language
    )
    return jsonOk({ products })
  } catch (error) {
    return jsonError(error.message)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth('ADMIN')
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    const product = await productService.createProduct({
      ...validatedData,
      establishment_id: session.user.establishment_id
    })
    return jsonOk({ product })
  } catch (error) {
    return jsonError(error.message)
  }
}
