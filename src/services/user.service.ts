import { prisma } from '@/lib/prisma';
import { User, UserRole, Establishment, EstablishmentAdministrator, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserCreateDTO, UserUpdateDTO, UserResponseDTO } from '../types/dtos/user';
import { EstablishmentAdministratorCreateDTO } from '../types/dtos/establishmentAdministrator';
import { userCreateSchema, userUpdateSchema, userIdSchema } from '../schemas/user';
import { establishmentAdministratorCreateSchema } from '../schemas/establishmentAdministrator';
import logger from '@/lib/logger';

const SALT_ROUNDS = 10;

export class UserService {
  // --- Utility mappers ---
  private mapToDTO(user: User & { establishment?: Establishment | null }): UserResponseDTO {
    return {
      userId: user.userId,
      role: user.role,
      name: user.name,
      email: user.email,
      establishmentId: user.establishmentId,
      createdAt: user.createdAt?.toISOString() || null,
      updatedAt: user.updatedAt?.toISOString() || null,
      establishment: user.establishment ? {
        establishmentId: user.establishment.establishmentId,
        name: user.establishment.name,
        taxId: user.establishment.taxId,
        address: user.establishment.address,
        postalCode: user.establishment.postalCode,
        city: user.establishment.city,
        phone1: user.establishment.phone1,
        phone2: user.establishment.phone2,
        billingBankDetails: user.establishment.billingBankDetails,
        paymentBankDetails: user.establishment.paymentBankDetails,
        contactPerson: user.establishment.contactPerson,
        description: user.establishment.description,
        website: user.establishment.website,
        isActive: user.establishment.isActive,
        acceptsOrders: user.establishment.acceptsOrders,
        createdAt: user.establishment.createdAt?.toISOString() || null,
        updatedAt: user.establishment.updatedAt?.toISOString() || null,
      } : null,
    };
  }

  // --- CRUD Operations ---
  async createUser(data: UserCreateDTO): Promise<UserResponseDTO> {
    userCreateSchema.parse(data);

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // ✅ CORRECCIÓN: Usar eslint-disable para la variable descartada
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...dataWithoutPassword } = data;

    const newUser = await prisma.user.create({
      data: {
        ...dataWithoutPassword,
        passwordHash: hashedPassword,
      },
      include: { establishment: true },
    });

    logger.info('User created successfully', { userId: newUser.userId, email: newUser.email });
    return this.mapToDTO(newUser);
  }

  async updateUser(userId: number, data: UserUpdateDTO): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ userId })
    userUpdateSchema.parse(data)

    // ✅ CORRECCIÓN 1: Usar el password en lugar de extraerlo y no usarlo
    const { password, ...restOfData } = data
    const updateData: Partial<Pick<User, 'name' | 'email' | 'establishmentId'>> & { passwordHash?: string } = {
      ...restOfData
    }

    // ✅ Ahora sí usamos el password extraído
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { userId },
        data: updateData,
        include: { establishment: true },
      });

      logger.info('User updated successfully', { userId, updatedFields: Object.keys(updateData) });
      return this.mapToDTO(updatedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // User not found
      }
      logger.error('Error updating user:', { userId, error });
      throw error;
    }
  }

  async createOAuthUser(data: {
    email: string;
    name?: string;
    googleId?: string;
    appleId?: string;
    role?: UserRole;
    establishmentId?: number;
  }): Promise<UserResponseDTO> {
    // Verificar si el usuario ya existe por email o OAuth ID
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.googleId ? [{ googleId: data.googleId }] : []),
          ...(data.appleId ? [{ appleId: data.appleId }] : []),
        ]
      }
    });

    if (existingUser) {
      // ✅ CORRECCIÓN 2: Tipar correctamente el updateData
      const updateData: {
        googleId?: string;
        appleId?: string;
        name?: string;
      } = {};

      if (data.googleId && !existingUser.googleId) {
        updateData.googleId = data.googleId;
      }
      if (data.appleId && !existingUser.appleId) {
        updateData.appleId = data.appleId;
      }
      if (data.name && !existingUser.name) {
        updateData.name = data.name;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { userId: existingUser.userId },
          data: updateData,
          include: { establishment: true },
        });
        return this.mapToDTO(updatedUser);
      }

      return this.mapToDTO(existingUser);
    }

    // Crear nuevo usuario OAuth
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || null,
        googleId: data.googleId || null,
        appleId: data.appleId || null,
        role: data.role || UserRole.client,
        establishmentId: data.establishmentId || null,
        passwordHash: null, // OAuth users don't have password
      },
      include: { establishment: true },
    });

    logger.info('OAuth user created successfully', { userId: newUser.userId, email: newUser.email });
    return this.mapToDTO(newUser);
  }

  async getAllUsers(page: number = 1, pageSize: number = 10): Promise<UserResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const users = await prisma.user.findMany({
      skip: skip,
      take: pageSize,
      include: { establishment: true },
      orderBy: { userId: 'asc' },
    });
    return users.map(user => this.mapToDTO(user));
  }

  async getUserById(userId: number): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ userId }); // Validate ID
    const user = await prisma.user.findUnique({
      where: { userId },
      include: { establishment: true },
    });
    return user ? this.mapToDTO(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserResponseDTO | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { establishment: true },
    });
    return user ? this.mapToDTO(user) : null;
  }

  // Método para buscar usuario por OAuth ID
  async getUserByOAuthId(provider: 'google' | 'apple', oauthId: string): Promise<UserResponseDTO | null> {
    const whereClause = provider === 'google'
      ? { googleId: oauthId }
      : { appleId: oauthId };

    const user = await prisma.user.findUnique({
      where: whereClause,
      include: { establishment: true },
    });

    return user ? this.mapToDTO(user) : null;
  }

  // Método específico para NextAuth's CredentialsProvider
  async verifyCredentials(credentials: { email?: string; password?: string }): Promise<Omit<User, 'passwordHash'> | null> {
    if (!credentials?.email || !credentials.password) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !user.passwordHash) {
      return null; // User not found or password not set (OAuth user)
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      return null; // Invalid password
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(userId: number): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ userId }); // Validate ID

    try {
      const deletedUser = await prisma.user.delete({
        where: { userId },
        include: { establishment: true },
      });

      logger.info('User deleted successfully', { userId });
      return this.mapToDTO(deletedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // User not found
      }
      logger.error('Error deleting user:', { userId, error });
      throw error;
    }
  }

  // --- Authorization methods ---
  async hasRole(userId: number, role: UserRole): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.role === role;
  }

  async isEstablishmentAdmin(userId: number, establishmentId: number): Promise<boolean> {
    const adminRecord = await prisma.establishmentAdministrator.findUnique({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId,
        },
      },
    });
    return !!adminRecord;
  }

  async canAccessEstablishment(userId: number, establishmentId: number): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    // General admin can access any establishment
    if (user.role === UserRole.general_admin) {
      return true;
    }

    // Check if user belongs to the establishment
    if (user.establishmentId === establishmentId) {
      return true;
    }

    // Check if user is an administrator of the establishment
    return await this.isEstablishmentAdmin(userId, establishmentId);
  }

  // --- Establishment Administrator Management ---
  async assignAdminToEstablishment(data: EstablishmentAdministratorCreateDTO): Promise<EstablishmentAdministrator> {
    establishmentAdministratorCreateSchema.parse(data);

    try {
      const adminRecord = await prisma.establishmentAdministrator.create({
        data: {
          userId: data.userId,
          establishmentId: data.establishmentId,
        },
      });

      logger.info('Admin assigned to establishment', { userId: data.userId, establishmentId: data.establishmentId });
      return adminRecord;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('User is already an administrator of this establishment');
      }
      logger.error('Error assigning admin to establishment:', { data, error });
      throw error;
    }
  }

  async removeAdminFromEstablishment(userId: number, establishmentId: number): Promise<EstablishmentAdministrator | null> {
    try {
      const removedAdmin = await prisma.establishmentAdministrator.delete({
        where: {
          userId_establishmentId: {
            userId,
            establishmentId,
          },
        },
      });

      logger.info('Admin removed from establishment', { userId, establishmentId });
      return removedAdmin;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      logger.error('Error removing admin from establishment:', { userId, establishmentId, error });
      throw error;
    }
  }

  async getEstablishmentAdmins(establishmentId: number): Promise<UserResponseDTO[]> {
    const adminRecords = await prisma.establishmentAdministrator.findMany({
      where: { establishmentId },
      include: {
        user: {
          include: { establishment: true }
        }
      }
    });

    return adminRecords.map(record => this.mapToDTO(record.user));
  }

  // --- Utility methods ---
  async getUserCount(): Promise<number> {
    return await prisma.user.count();
  }

  async getUsersByRole(role: UserRole): Promise<UserResponseDTO[]> {
    const users = await prisma.user.findMany({
      where: { role },
      include: { establishment: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDTO(user));
  }

  async getUsersByEstablishment(establishmentId: number): Promise<UserResponseDTO[]> {
    const users = await prisma.user.findMany({
      where: { establishmentId },
      include: { establishment: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDTO(user));
  }

  async searchUsers(query: string, limit: number = 10): Promise<UserResponseDTO[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { establishment: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDTO(user));
  }
}
