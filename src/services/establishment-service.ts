// src/services/establishment-service.ts
import { prisma } from '../lib/prisma';
import type { Establishment } from '@prisma/client';
import type { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '../types/dtos/establishment';
import { toSnakeCase } from '@/utils/case';

function cleanEstablishmentData(data: Partial<CreateEstablishmentDTO | UpdateEstablishmentDTO>) {
  // Elimina campos undefined y convierte a snake_case
  return toSnakeCase(
    Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    )
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
        is_active: options?.isActive, // snake_case aquí
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async getEstablishmentById(establishmentId: number): Promise<Establishment | null> {
    return prisma.establishment.findUnique({
      where: { establishment_id: establishmentId }, // snake_case aquí
    });
  },

  async updateEstablishment(establishmentId: number, data: UpdateEstablishmentDTO): Promise<Establishment | null> {
    const cleanData = cleanEstablishmentData(data);
    return prisma.establishment.update({
      where: { establishment_id: establishmentId }, // snake_case aquí
      data: cleanData,
    });
  },

  async deleteEstablishment(establishmentId: number): Promise<Establishment | null> {
    try {
      return await prisma.establishment.delete({
        where: { establishment_id: establishmentId }, // snake_case aquí
      });
    } catch (error) {
      console.error(`Error deleting establishment ${establishmentId}:`, error);
      throw error;
    }
  },

  async getEstablishmentWithDetails(establishmentId: number) {
    return prisma.establishment.findUnique({
      where: { establishment_id: establishmentId }, // snake_case aquí
      include: {
        categories: {
          where: { is_active: true }, // snake_case aquí
          orderBy: { sort_order: 'asc' }, // snake_case aquí
          include: {
            translations: true,
          },
        },
      },
    });
  },

  async setAcceptsOrders(establishmentId: number, acceptsOrders: boolean): Promise<Establishment | null> {
    return prisma.establishment.update({
      where: { establishment_id: establishmentId }, // snake_case aquí
      data: { accepts_orders: acceptsOrders }, // snake_case aquí
    });
  },
};
