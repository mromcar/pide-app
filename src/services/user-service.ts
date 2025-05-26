import { prisma } from '../lib/prisma';
import type { User } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO } from '../types/dtos/user';

function cleanUserData(data: Partial<CreateUserDTO | UpdateUserDTO>) {
  // Elimina campos undefined (no convierte a snake_case)
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
}

export const userService = {
  async createUser(data: CreateUserDTO): Promise<User> {
    const cleanData = cleanUserData(data);
    return prisma.user.create({ data: cleanData });
  },

  async getUserById(userId: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async updateUser(userId: number, data: UpdateUserDTO): Promise<User | null> {
    const cleanData = cleanUserData(data);
    return prisma.user.update({ where: { id: userId }, data: cleanData });
  },

  async deleteUser(userId: number): Promise<User | null> {
    return prisma.user.delete({ where: { id: userId } });
  },

  async listEmployees(establishmentId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { establishmentId, isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async setActive(userId: number, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  },

  async assignRole(userId: number, role: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },
};
