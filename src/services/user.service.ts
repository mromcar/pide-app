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
      userId: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
      establishmentId: user.establishment_id,
      createdAt: user.created_at?.toISOString() || null,
      updatedAt: user.updated_at?.toISOString() || null,
      establishment: user.establishment ? {
        establishmentId: user.establishment.establishment_id,
        name: user.establishment.name,
        taxId: user.establishment.tax_id,
        address: user.establishment.address,
        postalCode: user.establishment.postal_code,
        city: user.establishment.city,
        phone1: user.establishment.phone1,
        phone2: user.establishment.phone2,
        billingBankDetails: user.establishment.billing_bank_details,
        paymentBankDetails: user.establishment.payment_bank_details,
        contactPerson: user.establishment.contact_person,
        description: user.establishment.description,
        website: user.establishment.website,
        isActive: user.establishment.is_active,
        acceptsOrders: user.establishment.accepts_orders,
        createdAt: user.establishment.created_at?.toISOString() || null,
        updatedAt: user.establishment.updated_at?.toISOString() || null,
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

    // Excluir el campo 'password' del objeto data
    const { password, ...dataWithoutPassword } = data;

    const newUser = await prisma.user.create({
      data: {
        ...dataWithoutPassword,
        password_hash: hashedPassword,
      },
      include: { establishment: true },
    });

    logger.info('User created successfully', { userId: newUser.user_id, email: newUser.email });
    return this.mapToDTO(newUser);
  }

  // Método específico para crear usuarios OAuth
  async createOAuthUser(data: {
    email: string;
    name?: string;
    google_id?: string;
    apple_id?: string;
    role?: UserRole;
    establishment_id?: number;
  }): Promise<UserResponseDTO> {
    // Verificar si el usuario ya existe por email o OAuth ID
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.google_id ? [{ google_id: data.google_id }] : []),
          ...(data.apple_id ? [{ apple_id: data.apple_id }] : []),
        ]
      }
    });

    if (existingUser) {
      // Si existe, actualizar con los datos OAuth si es necesario
      const updateData: any = {};
      if (data.google_id && !existingUser.google_id) {
        updateData.google_id = data.google_id;
      }
      if (data.apple_id && !existingUser.apple_id) {
        updateData.apple_id = data.apple_id;
      }
      if (data.name && !existingUser.name) {
        updateData.name = data.name;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { user_id: existingUser.user_id },
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
        google_id: data.google_id || null,
        apple_id: data.apple_id || null,
        role: data.role || UserRole.client,
        establishment_id: data.establishment_id || null,
        password_hash: null, // OAuth users don't have password
      },
      include: { establishment: true },
    });

    logger.info('OAuth user created successfully', { userId: newUser.user_id, email: newUser.email });
    return this.mapToDTO(newUser);
  }

  async getAllUsers(page: number = 1, pageSize: number = 10): Promise<UserResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const users = await prisma.user.findMany({
      skip: skip,
      take: pageSize,
      include: { establishment: true },
      orderBy: { user_id: 'asc' },
    });
    return users.map(user => this.mapToDTO(user));
  }

  async getUserById(userId: number): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ user_id: userId }); // Validate ID
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
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
      ? { google_id: oauthId }
      : { apple_id: oauthId };

    const user = await prisma.user.findUnique({
      where: whereClause,
      include: { establishment: true },
    });

    return user ? this.mapToDTO(user) : null;
  }

  // Método específico para NextAuth's CredentialsProvider
  async verifyCredentials(credentials: { email?: string; password?: string }): Promise<Omit<User, 'password_hash'> | null> {
    if (!credentials?.email || !credentials.password) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !user.password_hash) {
      return null; // User not found or password not set (OAuth user)
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return null; // Invalid password
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: number, data: UserUpdateDTO): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ user_id: userId })
    userUpdateSchema.parse(data)

    const { password, ...restOfData } = data
    const updateData: Partial<Pick<User, 'name' | 'email' | 'establishment_id'>> & { password_hash?: string } = {
      ...restOfData
    }

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
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

  async deleteUser(userId: number): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ user_id: userId }); // Validate ID

    try {
      const deletedUser = await prisma.user.delete({
        where: { user_id: userId },
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
        user_id_establishment_id: {
          user_id: userId,
          establishment_id: establishmentId,
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
        data,
      });

      logger.info('Admin assigned to establishment', { userId: data.user_id, establishmentId: data.establishment_id });
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
          user_id_establishment_id: {
            user_id: userId,
            establishment_id: establishmentId,
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
      where: { establishment_id: establishmentId },
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
      orderBy: { created_at: 'desc' }
    });

    return users.map(user => this.mapToDTO(user));
  }

  async getUsersByEstablishment(establishmentId: number): Promise<UserResponseDTO[]> {
    const users = await prisma.user.findMany({
      where: { establishment_id: establishmentId },
      include: { establishment: true },
      orderBy: { created_at: 'desc' }
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
      orderBy: { created_at: 'desc' }
    });

    return users.map(user => this.mapToDTO(user));
  }
}
