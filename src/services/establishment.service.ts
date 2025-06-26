import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '../types/dtos/establishment';
import { EstablishmentAdministratorCreateDTO } from '../types/dtos/establishmentAdministrator';
import { UserResponseDTO } from '../types/dtos/user';
import { establishmentCreateSchema, establishmentUpdateSchema, establishmentIdSchema } from '../schemas/establishment';
import { userIdSchema } from '../schemas/user';
import { CategoryDTO } from '../types/dtos/category';
import { prisma } from '@/lib/prisma';
import { Establishment, Category, User, EstablishmentAdministrator, UserRole } from '@prisma/client';

export class EstablishmentService {
  // Obtener todos los establecimientos (con paginación opcional)
  async getAllEstablishments(page: number = 1, pageSize: number = 10): Promise<EstablishmentResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    
    const establishments = await prisma.establishment.findMany({
      skip: skip,
      take: pageSize,
    });
    return establishments.map(establishment => this.mapToDTO(establishment));
  }

  // Mapeador base a DTO (sin relaciones profundas)
  private mapToDTO(establishment: Establishment): EstablishmentResponseDTO {
    return {
      establishment_id: establishment.establishment_id,
      name: establishment.name,
      tax_id: establishment.tax_id,
      address: establishment.address,
      postal_code: establishment.postal_code,
      city: establishment.city,
      phone1: establishment.phone1,
      phone2: establishment.phone2,
      billing_bank_details: establishment.billing_bank_details,
      payment_bank_details: establishment.payment_bank_details,
      contact_person: establishment.contact_person,
      description: establishment.description,
      website: establishment.website,
      is_active: establishment.is_active,
      accepts_orders: establishment.accepts_orders,
      created_at: establishment.created_at?.toISOString() || null,
      updated_at: establishment.updated_at?.toISOString() || null,
    };
  }

  // Mapeador a DTO con relaciones
  private mapToDTOWithRelations(establishment: Establishment & {
    categories?: Category[],
    establishment_administrators?: (EstablishmentAdministrator & { user?: User })[]
  }): EstablishmentResponseDTO {
    return {
      ...this.mapToDTO(establishment),
      categories: establishment.categories?.map(cat => ({
        category_id: cat.category_id,
        establishment_id: cat.establishment_id,
        name: cat.name,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
        created_at: cat.created_at?.toISOString() || null,
        updated_at: cat.updated_at?.toISOString() || null,
        deleted_at: cat.deleted_at?.toISOString() || null,
      } as CategoryDTO)) || [],
      administrators: establishment.establishment_administrators
        ?.map(adminLink => {
          if (!adminLink.user) return null;
          return {
            user_id: adminLink.user.user_id,
            role: adminLink.user.role,
            name: adminLink.user.name,
            email: adminLink.user.email,
            establishment_id: adminLink.user.establishment_id,
            created_at: adminLink.user.created_at?.toISOString() || null,
            updated_at: adminLink.user.updated_at?.toISOString() || null,
          } as UserResponseDTO;
        })
        .filter((admin): admin is UserResponseDTO => admin !== null) || [],
    };
  }

  // Obtener un establecimiento por ID
  async getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
    try {
      establishmentIdSchema.parse({ establishmentId: id });
      
      const establishment = await prisma.establishment.findUnique({
        where: { establishment_id: id },
        include: {
          categories: true,
          establishment_administrators: {
            include: {
              user: true,
            },
          },
        },
      });
      
      return establishment ? this.mapToDTOWithRelations(establishment) : null;
    } catch (error) {
      console.error('Error in getEstablishmentById:', error);
      throw error;
    }
  }

  // Crear un nuevo establecimiento
  async createEstablishment(data: EstablishmentCreateDTO): Promise<EstablishmentResponseDTO> {
    establishmentCreateSchema.parse(data);
    
    const newEstablishment = await prisma.establishment.create({
      data: {
        ...data,
      },
    });
    
    return this.mapToDTO(newEstablishment);
  }

  // Actualizar un establecimiento existente
  async updateEstablishment(id: number, data: EstablishmentUpdateDTO): Promise<EstablishmentResponseDTO | null> {
    establishmentIdSchema.parse({ establishment_id: id });
    establishmentUpdateSchema.parse(data);

    const updatedEstablishment = await prisma.establishment.update({
      where: { establishment_id: id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    
    return this.mapToDTO(updatedEstablishment);
  }

  // Eliminar un establecimiento
  async deleteEstablishment(id: number): Promise<EstablishmentResponseDTO | null> {
    establishmentIdSchema.parse({ establishment_id: id });
    
    const deletedEstablishment = await prisma.establishment.delete({
      where: { establishment_id: id },
    });
    
    return this.mapToDTO(deletedEstablishment);
  }

  // Asignar un administrador a un establecimiento
  async addAdministratorToEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
    establishmentIdSchema.parse({ establishment_id: establishmentId });
    userIdSchema.parse({ user_id: userId });

    // Verificar que el usuario exista y tenga el rol adecuado
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user || (user.role !== UserRole.establishment_admin && user.role !== UserRole.general_admin)) {
      console.error('User not found or does not have admin privileges.');
      return null;
    }

    const newAdminLink = await prisma.establishmentAdministrator.create({
      data: {
        establishment_id: establishmentId,
        user_id: userId,
      },
    });
    
    return newAdminLink;
  }

  // Remover un administrador de un establecimiento
  async removeAdministratorFromEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
    establishmentIdSchema.parse({ establishment_id: establishmentId });
    userIdSchema.parse({ user_id: userId });

    const deletedAdminLink = await prisma.establishmentAdministrator.delete({
      where: {
        user_id_establishment_id: {
          user_id: userId,
          establishment_id: establishmentId,
        },
      },
    });
    
    return deletedAdminLink;
  }
}

export const establishmentService = new EstablishmentService();
