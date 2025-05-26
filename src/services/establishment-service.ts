// src/services/establishment-service.ts
import { prisma } from '../lib/prisma';
import type { Establishment } from '@prisma/client';
import type { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '../types/dtos/establishment';

function cleanEstablishmentData(data: Partial<CreateEstablishmentDTO | UpdateEstablishmentDTO>) {
  // Elimina campos undefined
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
}

export const establishmentService = {
  async createEstablishment(data: CreateEstablishmentDTO): Promise<Establishment> {
    const cleanData = cleanEstablishmentData(data);
    return prisma.establishment.create({
      data: cleanData,
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
    });
  },

  async updateEstablishment(establishmentId: number, data: UpdateEstablishmentDTO): Promise<Establishment | null> {
    const cleanData = cleanEstablishmentData(data);
    return prisma.establishment.update({
      where: { id: establishmentId },
      data: cleanData,
    });
  },

  async deleteEstablishment(establishmentId: number): Promise<Establishment | null> {
    try {
      return await prisma.establishment.delete({
        where: { id: establishmentId },
      });
    } catch (error) {
      console.error(`Error deleting establishment ${establishmentId}:`, error);
      throw error;
    }
  },

  async getEstablishmentWithDetails(establishmentId: number) {
    return prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true,
          },
        },
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
