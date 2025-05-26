// src/services/allergen-service.ts
import { prisma } from '../lib/prisma';
import type { Allergen } from '@prisma/client';
import type { CreateAllergenDTO, UpdateAllergenDTO } from '../types/dtos/allergen';

function cleanAllergenTranslation(t: any, allergenId?: number) {
  if (typeof t.languageCode !== 'string' || typeof t.name !== 'string') {
    throw new Error('Missing required fields for allergen translation');
  }
  return {
    ...(allergenId ? { allergenId } : {}),
    languageCode: t.languageCode,
    name: t.name,
    ...(typeof t.description === 'string' ? { description: t.description } : {}),
  };
}

export const allergenService = {
  async createAllergen(data: CreateAllergenDTO): Promise<Allergen> {
    const { translations, ...allergenData } = data;
    return prisma.allergen.create({
      data: {
        ...allergenData,
        translations: translations && translations.length > 0
          ? {
              createMany: {
                data: translations.map(t => cleanAllergenTranslation(t)),
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
        translations: true,
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
            data: translations.map(t => cleanAllergenTranslation(t, allergenId)),
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
    return prisma.allergen.delete({
      where: { id: allergenId },
    });
  },
};
