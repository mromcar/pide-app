// src/schemas/establishment.ts
import { z } from 'zod';

export const establishmentIdParamSchema = z.object({
  establishmentId: z.coerce.number().int().positive(), // o z.string().uuid() si usas UUIDs
});

// ... otros schemas de establishment
