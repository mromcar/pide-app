import { prisma } from '../lib/prisma';
import type { User } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO } from '../types/dtos/user';
import { UserRole } from '@prisma/client';

function cleanUserData(data: Partial<CreateUserDTO | UpdateUserDTO>) {
  // Elimina campos undefined
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== undefined)
  );
}

function cleanUserCreateData(data: CreateUserDTO) {
  const { password, ...rest } = data;
  if (!rest.email || !rest.role) {
    throw new Error('Missing required fields: email or role');
  }
  return {
    ...rest,
    passwordHash: password,
  };
}

export const userService = {
  async createUser(data: CreateUserDTO): Promise<User> {
    const cleanData = cleanUserCreateData(data);
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
      where: { establishmentId },
      orderBy: { name: 'asc' },
    });
  },

  async assignRole(userId: number, role: UserRole): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },
};
