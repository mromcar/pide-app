import { prisma } from '@/lib/prisma';
import { User, UserRole, Establishment, EstablishmentAdministrator, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Still needed for password hashing and comparison
// import jwt from 'jsonwebtoken'; // No longer needed for token generation here
import { UserCreateDTO, UserUpdateDTO, UserResponseDTO /* UserLoginDTO, UserLoginResponseDTO */ } from '../types/dtos/user'; // Login DTOs might be handled by NextAuth directly or adapted
import { EstablishmentAdministratorCreateDTO } from '../types/dtos/establishmentAdministrator';
import { EstablishmentResponseDTO } from '../types/dtos/establishment';
import { userCreateSchema, userUpdateSchema, userIdSchema /* userLoginSchema */ } from '../schemas/user'; // userLoginSchema might be less relevant here
import { establishmentAdministratorCreateSchema } from '../schemas/establishmentAdministrator';


// const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'; // No longer needed here
const SALT_ROUNDS = 10;

export class UserService {
  // --- Utility mappers ---
  private mapToDTO(user: User & { establishment?: Establishment | null }): UserResponseDTO {
    return {
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
      establishment_id: user.establishment_id,
      created_at: user.created_at?.toISOString() || null,
      updated_at: user.updated_at?.toISOString() || null,
      establishment: user.establishment ? {
        establishment_id: user.establishment.establishment_id,
        name: user.establishment.name,
        tax_id: user.establishment.tax_id,
        address: user.establishment.address,
        postal_code: user.establishment.postal_code,
        city: user.establishment.city,
        phone1: user.establishment.phone1,
        phone2: user.establishment.phone2,
        billing_bank_details: user.establishment.billing_bank_details,
        payment_bank_details: user.establishment.payment_bank_details,
        contact_person: user.establishment.contact_person,
        description: user.establishment.description,
        website: user.establishment.website,
        is_active: user.establishment.is_active,
        accepts_orders: user.establishment.accepts_orders,
        created_at: user.establishment.created_at?.toISOString() || null,
        updated_at: user.establishment.updated_at?.toISOString() || null,
      } : null,
    };
  }

  // --- CRUD Operations (largely unchanged) ---
  async createUser(data: UserCreateDTO): Promise<UserResponseDTO> {
    userCreateSchema.parse(data); // Validate input
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password_hash: hashedPassword,
      },
      include: { establishment: true },
    });
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
      include: { establishment: true }, // Include establishment for context
    });
    // Return the full User object as NextAuth might need it, or map to DTO if preferred for consistency
    // For NextAuth, often the raw user object (or a slightly augmented one) is more useful in the authorize callback
    return user ? this.mapToDTO(user) : null;
    // Or, if NextAuth needs more direct User object:
    // return user;
  }

  // This method is specifically for NextAuth's CredentialsProvider
  async verifyCredentials(credentials: { email?: string; password?: string }): Promise<Omit<User, 'password_hash'> | null> {
    if (!credentials?.email || !credentials.password) {
        return null;
    }
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !user.password_hash) {
      return null; // User not found or password not set
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return null; // Invalid password
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword; // userWithoutPassword ya no tiene password_hash
  }

  async updateUser(userId: number, data: UserUpdateDTO): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ user_id: userId }); // Validate ID
    userUpdateSchema.parse(data); // Validate input

    // Extraer la contraseña del DTO si existe, para no incluirla directamente en updateData
    const { password, ...restOfData } = data;
    const updateData: Partial<Omit<User, 'user_id' | 'created_at' | 'updated_at'>> & { password_hash?: string } = {
        ...restOfData
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data: updateData,
        include: { establishment: true },
      });
      return this.mapToDTO(updatedUser);
    } catch (error) { // Cambiado de error: any
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // Prisma error code for record not found
        return null;
      }
      // Considera registrar el error o manejar otros tipos de errores específicos
      console.error("Error updating user:", error);
      throw error; // Relanzar el error si no se maneja específicamente
    }
  }

  async deleteUser(userId: number): Promise<UserResponseDTO | null> {
    userIdSchema.parse({ user_id: userId }); // Validate ID
    try {
      const deletedUser = await prisma.user.delete({
        where: { user_id: userId },
        include: { establishment: true }, // To return the full DTO before deletion
      });
      return this.mapToDTO(deletedUser);
    } catch (error) { // Cambiado de error: any
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // --- Authorization (largely unchanged, used internally or by other services/API routes) ---
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

  // --- Establishment Administrator Management (unchanged) ---
  async assignAdminToEstablishment(data: EstablishmentAdministratorCreateDTO): Promise<EstablishmentAdministrator> {
    establishmentAdministratorCreateSchema.parse(data);
    return prisma.establishmentAdministrator.create({
      data,
    });
  }

  async removeAdminFromEstablishment(userId: number, establishmentId: number): Promise<EstablishmentAdministrator | null> {
    try {
      return await prisma.establishmentAdministrator.delete({
        where: {
          user_id_establishment_id: {
            user_id: userId,
            establishment_id: establishmentId,
          },
        },
      });
    } catch (error) { // Cambiado de error: any
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // Record to delete not found
        return null;
      }
      console.error("Error removing admin from establishment:", error);
      throw error;
    }
  }
}
