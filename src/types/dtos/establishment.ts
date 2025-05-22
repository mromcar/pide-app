// src/types/dtos/establishment.ts
import { z } from 'zod';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentIdParamSchema, // Asumiendo que crearás este schema
} from '../../schemas/establishment'; // Ajusta la ruta si es necesario

// Tipos inferidos de los esquemas Zod para el cuerpo de la solicitud (request body)
export type CreateEstablishmentDTO = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentDTO = z.infer<typeof updateEstablishmentSchema>;

// Tipos inferidos para parámetros de ruta (route params)
// Necesitarás definir 'establishmentIdParamSchema' en 'src/schemas/establishment.ts'
// Ejemplo de cómo podría ser establishmentIdParamSchema en src/schemas/establishment.ts:
// export const establishmentIdParamSchema = z.object({
//   establishmentId: z.coerce.number().int().positive(),
// });
export type EstablishmentIdParamDTO = z.infer<typeof establishmentIdParamSchema>;
