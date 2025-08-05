import { prisma } from '../lib/prisma';
import { Establishment, Prisma, Category, User, EstablishmentAdministrator, UserRole } from '@prisma/client';
import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '../types/dtos/establishment';
import { UserResponseDTO } from '../types/dtos/user';
import { establishmentCreateSchema, establishmentUpdateSchema, establishmentIdSchema } from '../schemas/establishment';
import { userIdSchema } from '../schemas/user';
import { CategoryDTO } from '../types/dtos/category';
import logger from '@/lib/logger';

// Mapeador base a DTO (sin relaciones profundas)
function mapToDTO(establishment: Establishment): EstablishmentResponseDTO {
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
function mapToDTOWithRelations(establishment: Establishment & {
  categories?: Category[],
  establishment_administrators?: (EstablishmentAdministrator & { user?: User })[]
}): EstablishmentResponseDTO {
  return {
    ...mapToDTO(establishment),
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

// Obtener todos los establecimientos (con paginación opcional)
export async function getAllEstablishments(page: number = 1, pageSize: number = 10): Promise<EstablishmentResponseDTO[]> {
  const skip = (page - 1) * pageSize;

  const establishments = await prisma.establishment.findMany({
    skip: skip,
    take: pageSize,
  });
  return establishments.map(establishment => mapToDTO(establishment));
}

// Obtener un establecimiento por ID
export async function getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
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

    return establishment ? mapToDTOWithRelations(establishment) : null;
  } catch (error) {
    logger.error('Error in getEstablishmentById:', { establishmentId: id, error });
    throw error;
  }
}

// Crear un nuevo establecimiento
export async function createEstablishment(data: EstablishmentCreateDTO): Promise<EstablishmentResponseDTO> {
  establishmentCreateSchema.parse(data);

  const newEstablishment = await prisma.establishment.create({
    data: {
      ...data,
    },
  });

  return mapToDTO(newEstablishment);
}

// Actualizar un establecimiento existente
export async function updateEstablishment(id: number, data: EstablishmentUpdateDTO): Promise<EstablishmentResponseDTO | null> {
  establishmentIdSchema.parse({ establishment_id: id });
  establishmentUpdateSchema.parse(data);

  const updatedEstablishment = await prisma.establishment.update({
    where: { establishment_id: id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return mapToDTO(updatedEstablishment);
}

// Eliminar un establecimiento
export async function deleteEstablishment(id: number): Promise<EstablishmentResponseDTO | null> {
  establishmentIdSchema.parse({ establishment_id: id });

  const deletedEstablishment = await prisma.establishment.delete({
    where: { establishment_id: id },
  });

  return mapToDTO(deletedEstablishment);
}

// Asignar un administrador a un establecimiento
export async function addAdministratorToEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
  establishmentIdSchema.parse({ establishment_id: establishmentId });
  userIdSchema.parse({ user_id: userId });

  // Verificar que el usuario exista y tenga el rol adecuado
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user || (user.role !== UserRole.establishment_admin && user.role !== UserRole.general_admin)) {
    logger.error('User not found or does not have admin privileges.', { userId });
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
export async function removeAdministratorFromEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
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
