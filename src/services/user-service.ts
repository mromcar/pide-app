import { prisma } from '../lib/prisma';
import type { User } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO } from '../types/dtos/user';
import { toSnakeCase } from '@/utils/case';

function cleanUserData(data: Partial<CreateUserDTO | UpdateUserDTO>) {
  // Elimina campos undefined y convierte a snake_case
  return toSnakeCase(
    Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    )
  );
}

export const userService = {
  async createUser(data: CreateUserDTO): Promise<User> {
    const cleanData = cleanUserData(data);
    return prisma.user.create({ data: cleanData });
  },

  async getUserById(userId: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { user_id: userId } }); // snake_case
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async updateUser(userId: number, data: UpdateUserDTO): Promise<User | null> {
    const cleanData = cleanUserData(data);
    return prisma.user.update({ where: { user_id: userId }, data: cleanData }); // snake_case
  },

  async deleteUser(userId: number): Promise<User | null> {
    return prisma.user.delete({ where: { user_id: userId } }); // snake_case
  },

  async listEmployees(establishmentId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { establishment_id: establishmentId, is_active: true }, // snake_case
      orderBy: { name: 'asc' },
    });
  },

  async setActive(userId: number, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { user_id: userId }, // snake_case
      data: { is_active: isActive }, // snake_case
    });
  },

  async assignRole(userId: number, role: string): Promise<User> {
    return prisma.user.update({
      where: { user_id: userId }, // snake_case
      data: { role },
    });
  },
};
