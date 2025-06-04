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

// const prisma = new PrismaClient(); // Remove this line

export class AllergenService {
  private readonly allergenInclude = {
    translations: true,
  };

  // Helper para mapear Allergen a AllergenResponseDTO
  private mapToDTO(allergen: Allergen & { translations?: AllergenTranslation[] }): AllergenResponseDTO {
    return {
      ...allergen,
      translations: allergen.translations ? allergen.translations.map(t => ({ ...t })) : [],
    };
  }

  // Crear un nuevo alérgeno
  public async createAllergen(data: CreateAllergenDTO): Promise<AllergenResponseDTO> {
    createAllergenSchema.parse(data); // Validar input

    const { translations, ...allergenData } = data;

    const newAllergen = await prisma.allergen.create({
      data: {
        ...allergenData,
        translations: {
          createMany: {
            data: translations ? translations.map(t => ({
              language_code: t.language_code,
              name: t.name || '', // Asegura que name sea string
              description: t.description || null, // Asegura que description sea string o null
            })) : [],
          },
        },
      },
      include: this.allergenInclude,
    });

    return this.mapToDTO(newAllergen);
  }

  // Obtener alérgeno por ID
  public async getAllergenById(allergen_id: number): Promise<AllergenResponseDTO | null> {
    allergenIdSchema.parse({ allergen_id }); // Validar ID

    const allergen = await prisma.allergen.findUnique({
      where: { allergen_id },
      include: this.allergenInclude,
    });

    return allergen ? this.mapToDTO(allergen) : null;
  }

  // Obtener todos los alérgenos
  public async getAllAllergens(): Promise<AllergenResponseDTO[]> {
    const allergens = await prisma.allergen.findMany({
      include: this.allergenInclude,
    });
    return allergens.map(this.mapToDTO);
  }

  // Actualizar un alérgeno existente
  public async updateAllergen(allergen_id: number, data: UpdateAllergenDTO): Promise<AllergenResponseDTO> {
    allergenIdSchema.parse({ allergen_id }); // Validar ID
    updateAllergenSchema.parse(data); // Validar input

    const { translations, ...allergenData } = data;

    const updatedAllergen = await prisma.allergen.update({
      where: { allergen_id },
      data: allergenData,
      include: this.allergenInclude,
    });

    // Manejar traducciones: eliminar, actualizar, crear
    if (translations !== undefined) {
      const existingTranslationIds = translations.filter(t => t.translation_id).map(t => t.translation_id);

      // Eliminar traducciones que ya no están en el input
      await prisma.allergenTranslation.deleteMany({
        where: {
          allergen_id,
          translation_id: {
            notIn: existingTranslationIds as number[],
          },
        },
      });

      // Actualizar o crear traducciones
      for (const translation of translations) {
        if (translation.translation_id) {
          // Actualizar
          updateAllergenTranslationSchema.parse(translation); // Validar traducción individual
          await prisma.allergenTranslation.update({
            where: { translation_id: translation.translation_id, allergen_id },
            data: {
              language_code: translation.language_code,
              name: translation.name || '', // Asegura que name sea string
              description: translation.description || null, // Asegura que description sea string o null
            },
          });
        } else {
          // Crear nueva traducción
          createAllergenTranslationSchema.parse(translation); // Validar traducción individual
          await prisma.allergenTranslation.create({
            data: {
              ...translation,
              name: translation.name || '', // Asegura que name sea string
              description: translation.description || null, // Asegura que description sea string o null
              allergen_id,
            },
          });
        }
      }
    }

    // Obtener el alérgeno actualizado con todas sus traducciones
    const finalAllergen = await prisma.allergen.findUnique({
      where: { allergen_id },
      include: this.allergenInclude,
    });

    if (!finalAllergen) {
      throw new Error(`Allergen with ID ${allergen_id} not found after update.`);
    }

    return this.mapToDTO(finalAllergen);
  }

  // Eliminar un alérgeno
  public async deleteAllergen(allergen_id: number): Promise<void> {
    allergenIdSchema.parse({ allergen_id }); // Validar ID

    await prisma.allergen.delete({
      where: { allergen_id },
    });
  }
}