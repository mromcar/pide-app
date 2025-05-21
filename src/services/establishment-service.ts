// src/services/establishment-service.ts
import prisma from '../lib/prisma'; // Ajusta esta ruta si es necesario
import type { Establishment } from '@prisma/client'; // Importa el tipo generado por Prisma
import type { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '../types/dtos/establishment'; // Asumiendo que crearás estos DTOs
import { createEstablishmentSchema, updateEstablishmentSchema } from '../schemas/establishment'; // Asumiendo que crearás estos schemas

// Podrías crear dtos y schemas para Establishment si aún no los tienes:
// src/schemas/establishment.ts
/*
import { z } from 'zod';
import { optionalString, optionalUrl } from './common';

export const createEstablishmentSchema = z.object({
  name: z.string().min(1).max(255),
  taxId: optionalString.max(20),
  address: optionalString,
  postalCode: optionalString.max(10),
  city: optionalString.max(100),
  phone1: optionalString.max(20),
  phone2: optionalString.max(20),
  billingBankDetails: optionalString,
  paymentBankDetails: optionalString,
  contactPerson: optionalString.max(255),
  description: optionalString,
  website: optionalUrl,
  isActive: z.boolean().default(true).optional(),
  acceptsOrders: z.boolean().default(true),
});
export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;

export const updateEstablishmentSchema = createEstablishmentSchema.partial();
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
*/

// src/types/dtos/establishment.ts
/*
import { z } from 'zod';
import { createEstablishmentSchema, updateEstablishmentSchema } from '../../schemas/establishment';

export type CreateEstablishmentDTO = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentDTO = z.infer<typeof updateEstablishmentSchema>;
*/


export const establishmentService = {
  async createEstablishment(data: CreateEstablishmentDTO): Promise<Establishment> {
    // La validación con Zod debería ocurrir antes de llamar al servicio (e.g., en la ruta API)
    // const validatedData = createEstablishmentSchema.parse(data);
    return prisma.establishment.create({
      data,
    });
  },

  async getAllEstablishments(options?: { isActive?: boolean }): Promise<Establishment[]> {
    return prisma.establishment.findMany({
      where: {
        isActive: options?.isActive,
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async getEstablishmentById(establishmentId: number): Promise<Establishment | null> {
    return prisma.establishment.findUnique({
      where: { id: establishmentId },
      // Considera incluir relaciones si son comúnmente necesarias
      // include: { categories: true, products: true }
    });
  },

  async updateEstablishment(establishmentId: number, data: UpdateEstablishmentDTO): Promise<Establishment | null> {
    // const validatedData = updateEstablishmentSchema.parse(data);
    return prisma.establishment.update({
      where: { id: establishmentId },
      data,
    });
  },

  async deleteEstablishment(establishmentId: number): Promise<Establishment | null> {
    // Considera la lógica de borrado: ¿borrado suave o en cascada?
    // Prisma maneja las restricciones onDelete definidas en tu schema.prisma
    // Si necesitas borrado suave, añade un campo `deletedAt` o `isDeleted` a tu modelo.
    try {
      return await prisma.establishment.delete({
        where: { id: establishmentId },
      });
    } catch (error) {
      // Manejar errores, e.g., si el establecimiento no se encuentra o hay restricciones
      console.error(`Error deleting establishment ${establishmentId}:`, error);
      // Podrías lanzar un error personalizado o devolver null/undefined
      throw error; // o return null;
    }
  },

  // --- Métodos adicionales ---
  async getEstablishmentWithDetails(establishmentId: number) {
    return prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true, // O filtrar por idioma específico
          },
        },
        // Otros includes como administradores, usuarios si es necesario
      },
    });
  },

  async setAcceptsOrders(establishmentId: number, acceptsOrders: boolean): Promise<Establishment | null> {
    return prisma.establishment.update({
      where: { id: establishmentId },
      data: { acceptsOrders },
    });
  },
};
