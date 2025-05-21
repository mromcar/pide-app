// src/services/allergen-service.ts
import prisma from '../lib/prisma';
import type { Allergen } from '@prisma/client';
import type { CreateAllergenDTO, UpdateAllergenDTO } from '../types/dtos/product'; // Usando los DTOs de product.ts si están allí

export const allergenService = {
  async createAllergen(data: CreateAllergenDTO): Promise<Allergen> {
    const { translations, ...allergenData } = data;
    return prisma.allergen.create({
      data: {
        ...allergenData,
        translations: translations
          ? {
              createMany: {
                data: translations.map(t => ({
                  languageCode: t.languageCode,
                  name: t.name,
                  description: t.description,
                })),
              },
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });
  },

  async getAllAllergens(): Promise<Allergen[]> {
    return prisma.allergen.findMany({
      include: {
        translations: true, // Considera filtrar por idioma
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async getAllergenById(allergenId: number): Promise<Allergen | null> {
    return prisma.allergen.findUnique({
      where: { id: allergenId },
      include: {
        translations: true,
      },
    });
  },

  async updateAllergen(allergenId: number, data: UpdateAllergenDTO): Promise<Allergen | null> {
    const { translations, ...allergenData } = data;

    return prisma.$transaction(async (tx) => {
      await tx.allergen.update({
        where: { id: allergenId },
        data: allergenData,
      });

      if (translations) {
        await tx.allergenTranslation.deleteMany({ where: { allergenId } });
        if (translations.length > 0) {
            await tx.allergenTranslation.createMany({
              data: translations.map(t => ({
                allergenId,
                languageCode: t.languageCode,
                name: t.name,
                description: t.description,
              })),
            });
        }
      }
      return tx.allergen.findUnique({
        where: { id: allergenId },
        include: { translations: true }
      });
    });
  },

  async deleteAllergen(allergenId: number): Promise<Allergen | null> {
    // La relación con ProductAllergen es onDelete: Cascade, así que se borrarán las asociaciones.
    return prisma.allergen.delete({
      where: { id: allergenId },
    });
  },
};
