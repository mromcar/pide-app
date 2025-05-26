// src/schemas/common.ts
import { z } from 'zod';

export const positiveInt = z.number().int().positive();
export const nonNegativeInt = z.number().int().nonnegative();
export const idSchema = positiveInt;

// UUID schema para modelos que usen UUIDs
export const uuidSchema = z.string().uuid();

// Permite IDs como string o number (útil para params de Next.js)
export const idParamSchema = z.union([z.coerce.number().int().positive(), uuidSchema]);

export const languageCodeSchema = z.string().min(2).max(10);

export const stringToBoolean = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return val;
}, z.boolean());

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
});
export type PaginationParams = z.infer<typeof paginationSchema>;

export const optionalString = z.string().optional().nullable();
export const optionalUrl = z.string().url().optional().nullable();

// Para campos de auditoría básicos (si los necesitas en DTOs de creación/actualización)
export const auditStampsSchema = z.object({
  // Normalmente estos son manejados por la BD/ORM, pero si el cliente los puede enviar:
  // createdAt: z.date().optional(),
  // updatedAt: z.date().optional(),
});
