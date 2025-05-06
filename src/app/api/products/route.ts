import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                ProductTranslation: true,
                variants: {
                    include: {
                        translations: true
                    }
                },
                allergens: {
                    include: {
                        allergen: {
                            include: {
                                translations: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Error fetching products' },
            { status: 500 }
        )
    }
}
