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
    establishmentId: establishment.establishmentId,
    name: establishment.name,
    taxId: establishment.taxId,
    address: establishment.address,
    postalCode: establishment.postalCode,
    city: establishment.city,
    phone1: establishment.phone1,
    phone2: establishment.phone2,
    billingBankDetails: establishment.billingBankDetails,
    paymentBankDetails: establishment.paymentBankDetails,
    contactPerson: establishment.contactPerson,
    description: establishment.description,
    website: establishment.website,
    isActive: establishment.isActive,
    acceptsOrders: establishment.acceptsOrders,
    createdAt: establishment.createdAt?.toISOString() || null,
    updatedAt: establishment.updatedAt?.toISOString() || null,
  };
}

// Mapeador a DTO con relaciones
function mapToDTOWithRelations(establishment: Establishment & {
  categories?: Category[],
  establishmentAdministrators?: (EstablishmentAdministrator & { user?: User })[]
}): EstablishmentResponseDTO {
  return {
    ...mapToDTO(establishment),
    categories: establishment.categories?.map(cat => ({
      categoryId: cat.categoryId,
      establishmentId: cat.establishmentId,
      name: cat.name,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      createdAt: cat.createdAt?.toISOString() || null,
      updatedAt: cat.updatedAt?.toISOString() || null,
      deletedAt: cat.deletedAt?.toISOString() || null,
    } as CategoryDTO)) || [],
    administrators: establishment.establishmentAdministrators
      ?.map(adminLink => {
        if (!adminLink.user) return null;
        return {
          userId: adminLink.user.userId,
          role: adminLink.user.role,
          name: adminLink.user.name,
          email: adminLink.user.email,
          establishmentId: adminLink.user.establishmentId,
          createdAt: adminLink.user.createdAt?.toISOString() || null,
          updatedAt: adminLink.user.updatedAt?.toISOString() || null,
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
  return establishments.map(mapToDTO);
}

// Obtener un establecimiento por ID
export async function getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
  try {
    establishmentIdSchema.parse({ establishmentId: id });

    const establishment = await prisma.establishment.findUnique({
      where: { establishmentId: id },
      include: {
        categories: true,
        establishmentAdministrators: {
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
  establishmentIdSchema.parse({ establishmentId: id });
  establishmentUpdateSchema.parse(data);

  const updatedEstablishment = await prisma.establishment.update({
    where: { establishmentId: id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  return mapToDTO(updatedEstablishment);
}

// Eliminar un establecimiento
export async function deleteEstablishment(id: number): Promise<EstablishmentResponseDTO | null> {
  establishmentIdSchema.parse({ establishmentId: id });

  const deletedEstablishment = await prisma.establishment.delete({
    where: { establishmentId: id },
  });

  return mapToDTO(deletedEstablishment);
}

// Asignar un administrador a un establecimiento
export async function addAdministratorToEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
  establishmentIdSchema.parse({ establishmentId });
  userIdSchema.parse({ userId });

  // Verificar que el usuario exista y tenga el rol adecuado
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user || (user.role !== UserRole.establishment_admin && user.role !== UserRole.general_admin)) {
    logger.error('User not found or does not have admin privileges.', { userId });
    return null;
  }

  const newAdminLink = await prisma.establishmentAdministrator.create({
    data: {
      establishmentId,
      userId,
    },
  });

  return newAdminLink;
}

// Remover un administrador de un establecimiento
export async function removeAdministratorFromEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
  establishmentIdSchema.parse({ establishmentId });
  userIdSchema.parse({ userId });

  const deletedAdminLink = await prisma.establishmentAdministrator.delete({
    where: {
      userId_establishmentId: {
        userId,
        establishmentId,
      },
    },
  });

  return deletedAdminLink;
}
