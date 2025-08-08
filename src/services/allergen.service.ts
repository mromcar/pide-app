import { prisma } from '@/lib/prisma';
import { Allergen, AllergenTranslation } from '@prisma/client';
import {
  CreateAllergenDTO,
  UpdateAllergenDTO,
  AllergenResponseDTO,
} from '../types/dtos/allergen';
import {
  CreateAllergenTranslationDTO,
  UpdateAllergenTranslationDTO,
  AllergenTranslationResponseDTO
} from '../types/dtos/allergenTranslation';
import {
  createAllergenSchema,
  updateAllergenSchema,
  allergenIdSchema
} from '../schemas/allergen';
import {
  createAllergenTranslationSchema,
  updateAllergenTranslationSchema
} from '../schemas/allergenTranslation';

export class AllergenService {
  private readonly allergenInclude = {
    translations: true,
  };

  // Helper para mapear Allergen a AllergenResponseDTO en camelCase
  private mapToDTO(allergen: Allergen & { translations?: AllergenTranslation[] }): AllergenResponseDTO {
    // Prisma ya devuelve camelCase, así que solo casteamos
    return {
      ...allergen,
      translations: allergen.translations ? allergen.translations.map(t => ({ ...t })) : [],
    } as AllergenResponseDTO;
  }

  // Crear un nuevo alérgeno
  public async createAllergen(data: CreateAllergenDTO): Promise<AllergenResponseDTO> {
    createAllergenSchema.parse(data);

    const { translations, ...allergenData } = data;

    const newAllergen = await prisma.allergen.create({
      data: {
        ...allergenData,
        translations: {
          createMany: {
            data: translations ? translations.map(t => ({
              language_code: t.language_code,
              name: t.name || '',
              description: t.description || null,
            })) : [],
          },
        },
      },
      include: this.allergenInclude,
    });

    return this.mapToDTO(newAllergen);
  }

  // Obtener alérgeno por ID
  public async getAllergenById(allergenId: number): Promise<AllergenResponseDTO | null> {
    allergenIdSchema.parse({ allergen_id: allergenId });

    const allergen = await prisma.allergen.findUnique({
      where: { allergen_id: allergenId },
      include: this.allergenInclude,
    });

    return allergen ? this.mapToDTO(allergen) : null;
  }

  // Obtener todos los alérgenos
  public async getAllAllergens(): Promise<AllergenResponseDTO[]> {
    const allergens = await prisma.allergen.findMany({
      include: this.allergenInclude,
    });
    return allergens.map(this.mapToDTO.bind(this));
  }

  // Actualizar un alérgeno existente
  public async updateAllergen(allergenId: number, data: UpdateAllergenDTO): Promise<AllergenResponseDTO> {
    allergenIdSchema.parse({ allergen_id: allergenId });
    updateAllergenSchema.parse(data);

    const { translations, ...allergenData } = data;

    const updatedAllergen = await prisma.allergen.update({
      where: { allergen_id: allergenId },
      data: allergenData,
      include: this.allergenInclude,
    });

    // Manejar traducciones: eliminar, actualizar, crear
    if (translations !== undefined) {
      const existingTranslationIds = translations.filter(t => t.translation_id).map(t => t.translation_id);

      // Eliminar traducciones que ya no están en el input
      await prisma.allergenTranslation.deleteMany({
        where: {
          allergen_id: allergenId,
          translation_id: {
            notIn: existingTranslationIds as number[],
          },
        },
      });

      // Actualizar o crear traducciones
      for (const translation of translations) {
        if (translation.translation_id) {
          updateAllergenTranslationSchema.parse(translation);
          await prisma.allergenTranslation.update({
            where: { translation_id: translation.translation_id, allergen_id: allergenId },
            data: {
              language_code: translation.language_code,
              name: translation.name || '',
              description: translation.description || null,
            },
          });
        } else {
          createAllergenTranslationSchema.parse(translation);
          await prisma.allergenTranslation.create({
            data: {
              ...translation,
              name: translation.name || '',
              description: translation.description || null,
              allergen_id: allergenId,
            },
          });
        }
      }
    }

    // Obtener el alérgeno actualizado con todas sus traducciones
    const finalAllergen = await prisma.allergen.findUnique({
      where: { allergen_id: allergenId },
      include: this.allergenInclude,
    });

    if (!finalAllergen) {
      throw new Error(`Allergen with ID ${allergenId} not found after update.`);
    }

    return this.mapToDTO(finalAllergen);
  }

  // Eliminar un alérgeno
  public async deleteAllergen(allergenId: number): Promise<void> {
    allergenIdSchema.parse({ allergen_id: allergenId });

    await prisma.allergen.delete({
      where: { allergen_id: allergenId },
    });
  }
}
