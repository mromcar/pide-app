import { prisma } from '@/lib/prisma'

export class MenuService {
  static async getMenu(establishmentId: number) {
    return prisma.category.findMany({
      where: { establishmentId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        products: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true,
            variants: {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
              include: { translations: true },
            },
            allergens: true, // ProductAllergen[]
          },
        },
      },
    })
  }
}
