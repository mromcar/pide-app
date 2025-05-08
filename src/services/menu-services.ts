import { PrismaClient } from '@prisma/client'
import type { DBCategory, EstablishmentBasic } from '@/types/menu'

export async function getCategoriesWithProducts(establishmentId: number, languageCode: string): Promise<DBCategory[]> {
    const db = new PrismaClient({
        log: ['query', 'error', 'warn'],
    })

    try {
        return await db.category.findMany({
            where: {
                establishment_id: establishmentId,
                is_active: true,
            },
            select: {
                category_id: true,
                establishment_id: true,
                name: true,
                image_url: true,
                sort_order: true,
                is_active: true,
                products: {
                    where: { is_active: true },
                    select: {
                        product_id: true,
                        establishment_id: true,
                        category_id: true,
                        name: true,
                        description: true,
                        image_url: true,
                        sort_order: true,
                        is_active: true,
                        ProductTranslation: {
                            where: { language_code: languageCode },
                            select: {
                                translation_id: true,
                                product_id: true,
                                language_code: true,
                                name: true,
                                description: true,
                            },
                        },
                        variants: {
                            where: { is_active: true },
                            select: {
                                variant_id: true,
                                product_id: true,
                                establishment_id: true,
                                variant_description: true,
                                price: true,
                                sku: true,
                                sort_order: true,
                                is_active: true,
                                translations: {
                                    where: { language_code: languageCode },
                                    select: {
                                        translation_id: true,
                                        variant_id: true,
                                        language_code: true,
                                        variant_description: true,
                                    },
                                },
                            },
                        },
                    },
                },
                CategoryTranslation: {
                    where: { language_code: languageCode },
                    select: {
                        translation_id: true,
                        category_id: true,
                        language_code: true,
                        name: true,
                    },
                },
            },
        })
    } finally {
        await db.$disconnect()
    }
}

export async function getEstablishmentById(establishmentId: number): Promise<EstablishmentBasic | null> {
    const db = new PrismaClient({
        log: ['query', 'error', 'warn'],
    })

    try {
        const result = await db.establishment.findUnique({
            where: {
                establishment_id: establishmentId
            },
            select: {
                establishment_id: true,
                name: true,
                description: true,
                website: true,
                is_active: true,
                accepts_orders: true,
            }
        })

        return result
    } catch (error) {
        console.error('Error:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

