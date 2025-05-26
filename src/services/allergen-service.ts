// src/services/allergen-service.ts
import { prisma } from '../lib/prisma';
import type { Allergen } from '@prisma/client';
import type { CreateAllergenDTO, UpdateAllergenDTO, AllergenTranslationDTO } from '../types/dtos/allergen';
import { toSnakeCase } from '@/utils/case';

// Para createMany en relación (NO incluir allergenId)
function cleanAllergenTranslation(t: AllergenTranslationDTO) {
  return {
    languageCode: t.languageCode,
    name: t.name,
    description: typeof t.description === 'string' ? t.description : null,
  };
}

// Para createMany directo sobre el modelo (SÍ incluir allergenId)
function cleanAllergenTranslationWithId(t: AllergenTranslationDTO, allergenId: number) {
  return {
    allergenId,
    languageCode: t.languageCode,
    name: t.name,
    description: typeof t.description === 'string' ? t.description : null,
  };
}

export async function createAllergen(data: CreateAllergenDTO): Promise<Allergen> {
  const { translations, ...allergenData } = data;
  return prisma.allergen.create({
    data: {
      ...allergenData, // Usa camelCase aquí, no toSnakeCase
      translations: translations && translations.length > 0
        ? {
          createMany: {
            data: translations.map((t: AllergenTranslationDTO) => cleanAllergenTranslation(t)),
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
            establishmentId
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
      where: { id: allergenId },
      data: allergenData, // Usa camelCase aquí
    });

    if (translations) {
      await tx.allergenTranslation.deleteMany({ where: { allergenId } });
      if (translations.length > 0) {
        await tx.allergenTranslation.createMany({
          data: translations.map((t: AllergenTranslationDTO) => cleanAllergenTranslationWithId(t, allergenId)),
        });
      }
    }
    return tx.allergen.findUnique({
      where: { id: allergenId },
      include: { translations: true }
    });
  });
}

export async function deleteAllergen(allergenId: number): Promise<Allergen | null> {
  return prisma.allergen.delete({
    where: { id: allergenId },
  });
}
