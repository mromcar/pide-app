import { prisma } from '@/lib/prisma';
import { PrismaClient, Establishment, EstablishmentAdministrator, User, Category, UserRole } from '@prisma/client'; // Mantén esta si usas tipos específicos
import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '../types/dtos/establishment';
import { EstablishmentAdministratorCreateDTO } from '../types/dtos/establishmentAdministrator'; // Asumiendo que existe
import { UserResponseDTO } from '../types/dtos/user'; // Para respuestas que incluyan administradores
import { establishmentCreateSchema, establishmentUpdateSchema, establishmentIdSchema } from '../schemas/establishment';
import { userIdSchema } from '../schemas/user'; // Para validar IDs de usuario al asignar administradores
import { CategoryDTO } from '../types/dtos/category'; // Importa CategoryDTO

// const prisma = new PrismaClient(); // <--- ELIMINA ESTA LÍNEA

export class EstablishmentService {
  // Obtener todos los establecimientos (con paginación opcional)
  async getAllEstablishments(page: number = 1, pageSize: number = 10): Promise<EstablishmentResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const establishments = await prisma.establishment.findMany({
      skip: skip,
      take: pageSize,
      // Aquí puedes añadir 'include' para cargar relaciones si es necesario en la vista de lista
      // include: { categories: true }
    });
    return establishments.map(this.mapToDTO);
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
      // Las relaciones se mapean en un método separado o según necesidad
    };
  }

  // Mapeador a DTO con relaciones
  private mapToDTOWithRelations(establishment: Establishment & {
    categories?: Category[],
    establishment_administrators?: (EstablishmentAdministrator & { user?: User })[]
  }): EstablishmentResponseDTO {
    return {
      ...this.mapToDTO(establishment), // Llama al mapeador base
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
        // translations: [], // Puedes mapear traducciones si es necesario y si las incluyes en la consulta
      } as CategoryDTO)) || [],
      administrators: establishment.establishment_administrators?.map(adminLink => {
        // Asegúrate que adminLink.user no sea undefined antes de acceder a sus propiedades
        if (!adminLink.user) return null; // O maneja este caso como prefieras
        return {
          user_id: adminLink.user.user_id,
          role: adminLink.user.role,
          name: adminLink.user.name,
          email: adminLink.user.email,
          establishment_id: adminLink.user.establishment_id,
          created_at: adminLink.user.created_at?.toISOString() || null,
          updated_at: adminLink.user.updated_at?.toISOString() || null,
          // No incluyas establishment aquí para evitar ciclos, a menos que sea un DTO más simple
        } as UserResponseDTO;
      }).filter(admin => admin !== null) as UserResponseDTO[] || [], // Filtra los nulos si los devuelves
    };
  }

  // Obtener un establecimiento por ID
  async getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
    establishmentIdSchema.parse({ establishment_id: id }); // Validar ID
    const establishment = await prisma.establishment.findUnique({
      where: { establishment_id: id },
      include: {
        categories: true, // Incluye las categorías directamente
        establishment_administrators: {
          include: {
            user: true, // Incluye el usuario administrador
          },
        },
      },
    });
    // El tipo de 'establishment' aquí ya debería ser compatible con mapToDTOWithRelations
    // si Prisma Client está bien configurado y los 'include' son correctos.
    return establishment ? this.mapToDTOWithRelations(establishment) : null;
  }

  // Crear un nuevo establecimiento
  async createEstablishment(data: EstablishmentCreateDTO): Promise<EstablishmentResponseDTO> {
    establishmentCreateSchema.parse(data); // Validar datos de entrada
    const newEstablishment = await prisma.establishment.create({
      data: {
        ...data,
        // Aquí puedes manejar la creación de entidades relacionadas si es necesario
        // Por ejemplo, si EstablishmentCreateDTO incluye datos para crear administradores iniciales
      },
    });
    return this.mapToDTO(newEstablishment);
  }

  // Actualizar un establecimiento existente
  async updateEstablishment(id: number, data: EstablishmentUpdateDTO): Promise<EstablishmentResponseDTO | null> {
    establishmentIdSchema.parse({ establishment_id: id }); // Validar ID
    establishmentUpdateSchema.parse(data); // Validar datos de entrada

    const updatedEstablishment = await prisma.establishment.update({
      where: { establishment_id: id },
      data: {
        ...data,
        updated_at: new Date(), // Actualizar la fecha de modificación
      },
    });
    return this.mapToDTO(updatedEstablishment);
  }

  // Eliminar un establecimiento (marcado suave o eliminación real según tu lógica)
  async deleteEstablishment(id: number): Promise<EstablishmentResponseDTO | null> {
    establishmentIdSchema.parse({ establishment_id: id }); // Validar ID
    // Aquí decides si es borrado físico o lógico (actualizando un campo `deleted_at` o `is_active`)
    // Ejemplo de borrado físico:
    const deletedEstablishment = await prisma.establishment.delete({
      where: { establishment_id: id },
    });
    return this.mapToDTO(deletedEstablishment);
    // Ejemplo de borrado lógico (si tienes un campo `is_active`):
    /*
    const deactivatedEstablishment = await prisma.establishment.update({
      where: { establishment_id: id },
      data: { is_active: false, updated_at: new Date() },
    });
    return this.mapToDTO(deactivatedEstablishment);
    */
  }

  // Asignar un administrador a un establecimiento
  async addAdministratorToEstablishment(establishmentId: number, userId: number): Promise<EstablishmentAdministrator | null> {
    establishmentIdSchema.parse({ establishment_id: establishmentId });
    userIdSchema.parse({ user_id: userId });

    // Verificar que el usuario exista y tenga el rol adecuado (opcional, pero recomendado)
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user || (user.role !== UserRole.establishment_admin && user.role !== UserRole.general_admin)) {
      // Podrías lanzar un error específico o devolver null
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

// Exportar una instancia del servicio para usarla en la aplicación
export const establishmentService = new EstablishmentService();
