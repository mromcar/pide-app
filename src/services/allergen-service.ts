// src/services/allergen-service.ts
import { prisma } from '../lib/prisma';
import type { Allergen } from '@prisma/client';
import type { CreateAllergenDTO, UpdateAllergenDTO } from '../types/dtos/allergen';
import { toSnakeCase } from '@/utils/case';
import { z } from 'zod';
import { allergenTranslationSchema } from '../schemas/allergen';
import type { AllergenTranslationDTO } from '../types/dtos/allergen';

export type AllergenTranslationDTO = z.infer<typeof allergenTranslationSchema>

function cleanAllergenTranslation(t: AllergenTranslationDTO, allergenId?: number) {
  return {
    ...(allergenId ? { allergen_id: allergenId } : {}),
    language_code: t.languageCode,
    name: t.name,
    description: typeof t.description === 'string' ? t.description : null,
  };
}

export async function createAllergen(data: CreateAllergenDTO): Promise<Allergen> {
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
}

export async function getAllAllergens(establishmentId: number): Promise<Allergen[]> {
  return prisma.allergen.findMany({
    where: {
      products: {
        some: {
          product: {
            establishment_id: establishmentId
          }
        }
      }
    },
    include: {
      translations: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getAllergenById(allergenId: number): Promise<Allergen | null> {
  return prisma.allergen.findUnique({
    where: { id: allergenId },
    include: {
      translations: true,
    },
  });
}

export async function updateAllergen(
  allergenId: number,
  data: UpdateAllergenDTO
): Promise<Allergen | null> {
  const { translations, ...allergenData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.allergen.update({
      where: { allergen_id: allergenId },
      data: allergenData,
    });

    if (translations) {
      await tx.allergenTranslation.deleteMany({ where: { allergen_id: allergenId } });
      if (translations.length > 0) {
        await tx.allergenTranslation.createMany({
          data: translations.map((t: AllergenTranslationDTO) => cleanAllergenTranslation(t, allergenId)),
        });
      }
    }
    return tx.allergen.findUnique({
      where: { allergen_id: allergenId },
      include: { translations: true }
    });
  });
}

export async function deleteAllergen(allergenId: number): Promise<Allergen | null> {
  return prisma.allergen.delete({
    where: { allergen_id: allergenId },
  });
}
